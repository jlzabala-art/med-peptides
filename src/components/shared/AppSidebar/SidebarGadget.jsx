import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import AppSidebar from './index';
import { Settings, Save, X } from 'lucide-react';

export default function SidebarGadget(props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarGroups, setSidebarGroups] = useState(props.groups || []);
  const [activeDragItem, setActiveDragItem] = useState(null);
  
  // Storage key for user preferences
  const storageKey = props.prefsKey || 'sidebar_groups_prefs';
  const prefsDocRef = user ? doc(db, 'users', user.uid, 'preferences', storageKey) : null;

  const rehydrateGroups = (savedGroups, originalGroups) => {
    const allItems = new Map();
    originalGroups.forEach(g => {
      if (g.items) {
        g.items.forEach(i => allItems.set(i.id, i));
      }
    });

    return savedGroups.map(savedGroup => {
      const origGroup = originalGroups.find(g => g.id === savedGroup.id) || 
                        (savedGroup.id === 'favorites' ? { id: 'favorites', label: 'Favorites', emoji: '⭐' } : savedGroup);
      
      const hydratedItems = (savedGroup.items || [])
        .map(savedItem => allItems.get(savedItem.id) || null)
        .filter(Boolean);

      return {
        ...origGroup,
        id: savedGroup.id,
        items: hydratedItems
      };
    });
  };

  useEffect(() => {
    async function loadPreferences() {
      // Storage key for user preferences
      const currentPrefsDocRef = user ? doc(db, 'users', user.uid, 'preferences', storageKey) : null;

      // First try localStorage for immediate local feedback
      const localPrefs = localStorage.getItem(storageKey);
      if (localPrefs) {
        try {
          const parsed = JSON.parse(localPrefs);
          setSidebarGroups(rehydrateGroups(parsed, props.groups));
        } catch(e) {}
      }

      if (!currentPrefsDocRef) {
        if (!localPrefs) injectFavoritesGroup(props.groups);
        return;
      }
      
      try {
        const snap = await getDoc(currentPrefsDocRef);
        if (snap.exists() && snap.data().groups) {
          const rehydrated = rehydrateGroups(snap.data().groups, props.groups);
          setSidebarGroups(rehydrated);
          localStorage.setItem(storageKey, JSON.stringify(snap.data().groups));
        } else if (!localPrefs) {
          // Ensure "Favorites" exists
          injectFavoritesGroup(props.groups);
        }
      } catch (e) {
        console.error("Failed to load sidebar preferences", e);
        if (!localPrefs) injectFavoritesGroup(props.groups);
      }
    }
    loadPreferences();
  }, [user, props.groups]);

  const injectFavoritesGroup = (initialGroups) => {
    const hasFavs = initialGroups.some(g => g.id === 'favorites');
    if (!hasFavs) {
      setSidebarGroups([
        { id: 'favorites', label: 'Favorites', emoji: '⭐', items: [] },
        ...initialGroups
      ]);
    } else {
      setSidebarGroups(initialGroups);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === 'item') {
      setActiveDragItem({ ...activeData.item, type: 'item' });
    } else if (activeData?.type === 'group') {
      setActiveDragItem({ ...activeData.group, type: 'group' });
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveItem = active.data.current?.type === 'item';
    const isOverItem = over.data.current?.type === 'item';
    const isActiveGroup = active.data.current?.type === 'group';
    const isOverGroup = over.data.current?.type === 'group';

    if (isActiveGroup && isOverGroup) {
      // Group reordering should be done in handleDragEnd to prevent dnd-kit issues
      return;
    }

    if (!isActiveItem) return; // Only reorder items

    setSidebarGroups((prev) => {
      const activeGroupIndex = prev.findIndex(g => g.items?.some(i => i.id === activeId));
      if (activeGroupIndex === -1) return prev;
      
      const activeItemIndex = prev[activeGroupIndex].items.findIndex(i => i.id === activeId);

      // Dropping item over another item
      if (isOverItem) {
        const overGroupIndex = prev.findIndex(g => g.items?.some(i => i.id === overId));
        if (overGroupIndex === -1) return prev;
        
        const overItemIndex = prev[overGroupIndex].items.findIndex(i => i.id === overId);

        if (activeGroupIndex !== overGroupIndex) {
          const newGroups = prev.map(g => ({ ...g, items: [...(g.items || [])] }));
          const [movedItem] = newGroups[activeGroupIndex].items.splice(activeItemIndex, 1);
          newGroups[overGroupIndex].items.splice(overItemIndex, 0, movedItem);
          return newGroups;
        } else {
          const newGroups = prev.map(g => ({ ...g, items: [...(g.items || [])] }));
          newGroups[activeGroupIndex].items = arrayMove(newGroups[activeGroupIndex].items, activeItemIndex, overItemIndex);
          return newGroups;
        }
      }

      // Dropping item over an empty group
      if (isOverGroup) {
        const overGroupIndex = prev.findIndex(g => g.id === overId);
        if (overGroupIndex === -1) return prev;

        if (activeGroupIndex !== overGroupIndex) {
          const newGroups = prev.map(g => ({ ...g, items: [...(g.items || [])] }));
          const activeItems = newGroups[activeGroupIndex].items;
          const overItems = newGroups[overGroupIndex].items;
          
          const [movedItem] = activeItems.splice(activeItemIndex, 1);
          const overIndexWithFallback = overItemIndex >= 0 ? overItemIndex : overItems.length + 1;
          overItems.splice(overIndexWithFallback, 0, movedItem);
          return newGroups;
        }
      }

      return prev;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragItem(null);
    
    setSidebarGroups(currentGroups => {
      let newGroups = currentGroups;
      
      if (active && over && active.id !== over.id) {
        const isActiveGroup = active.data.current?.type === 'group';
        const isOverGroup = over.data.current?.type === 'group';
        
        if (isActiveGroup && isOverGroup) {
          const activeGroupIndex = currentGroups.findIndex(g => g.id === active.id);
          const overGroupIndex = currentGroups.findIndex(g => g.id === over.id);
          
          if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
            newGroups = arrayMove(currentGroups, activeGroupIndex, overGroupIndex);
          }
        }
      }

      // Auto-save the new state
      setTimeout(() => savePreferences(newGroups), 0);
      return newGroups;
    });
  };

  const savePreferences = async (groupsToSave = sidebarGroups) => {
    const serializedGroups = groupsToSave.map(g => ({
      id: g.id,
      label: g.label,
      emoji: g.emoji,
      items: (g.items || []).map(i => ({ id: i.id, label: i.label, path: i.path }))
    }));

    // Save to localStorage for immediate local persistence
    localStorage.setItem(storageKey, JSON.stringify(serializedGroups));

    if (prefsDocRef) {
      try {
        await setDoc(prefsDocRef, { groups: serializedGroups }, { merge: true });
        setIsEditing(false);
      } catch (e) {
        console.error("Failed to save sidebar preferences", e);
        setIsEditing(false); // still exit edit mode
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleToggleFavorite = (itemId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // Find the item globally from props.groups
    let targetItem = null;
    for (const g of props.groups) {
      if (g.items) {
        const found = g.items.find(i => i.id === itemId);
        if (found) {
          targetItem = found;
          break;
        }
      }
    }
    
    if (!targetItem) return;

    setSidebarGroups(prev => {
      const newGroups = prev.map(g => ({ ...g, items: [...(g.items || [])] }));
      const favGroup = newGroups.find(g => g.id === 'favorites');
      
      if (!favGroup) return prev; // Safety check
      
      const isFav = favGroup.items.some(i => i.id === itemId);
      if (isFav) {
        favGroup.items = favGroup.items.filter(i => i.id !== itemId);
      } else {
        favGroup.items.push(targetItem);
      }
      return newGroups;
    });
  };

  const toggleEditMode = () => {
    if (isEditing) savePreferences(sidebarGroups);
    else setIsEditing(true);
  };

  const resetToDefault = async () => {
    const defaultGroups = [
      { id: 'favorites', label: 'Favorites', emoji: '⭐', items: [] },
      ...props.groups
    ];
    setSidebarGroups(defaultGroups);
    await savePreferences(defaultGroups);
    setIsEditing(false);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <AppSidebar 
        {...props} 
        groups={sidebarGroups} 
        isEditing={isEditing}
        onToggleFavorite={handleToggleFavorite}
        footer={{
          label: isEditing ? "Save Menu" : "Customize Menu",
          icon: isEditing ? Save : Settings,
          onClick: toggleEditMode,
          onReset: isEditing ? resetToDefault : null
        }}
      />
      {/* Drag Overlay for smooth animations */}
      <DragOverlay>
        {activeDragItem ? (
          <div style={{ padding: '8px 16px', background: 'var(--color-bg-hover)', border: '1px dashed var(--primary)', borderRadius: '4px', opacity: 0.9 }}>
            {activeDragItem.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
