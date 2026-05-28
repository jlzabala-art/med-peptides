import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
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
  const prefsDocRef = user ? doc(db, 'users', user.uid, 'preferences', 'sidebar') : null;

  useEffect(() => {
    async function loadPreferences() {
      // First try localStorage for immediate local feedback
      const localPrefs = localStorage.getItem('sidebar_groups_prefs');
      if (localPrefs) {
        try {
          setSidebarGroups(JSON.parse(localPrefs));
        } catch(e) {}
      }

      if (!prefsDocRef) {
        if (!localPrefs) injectFavoritesGroup(props.groups);
        return;
      }
      
      try {
        const snap = await getDoc(prefsDocRef);
        if (snap.exists() && snap.data().groups) {
          setSidebarGroups(snap.data().groups);
          localStorage.setItem('sidebar_groups_prefs', JSON.stringify(snap.data().groups));
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
  }, [user, props.groups, prefsDocRef]);

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === 'item') {
      setActiveDragItem(activeData.item);
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
    const isOverGroup = over.data.current?.type === 'group';

    if (!isActiveItem) return; // Only reorder items for now

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
          const newGroups = JSON.parse(JSON.stringify(prev));
          const [movedItem] = newGroups[activeGroupIndex].items.splice(activeItemIndex, 1);
          newGroups[overGroupIndex].items.splice(overItemIndex, 0, movedItem);
          return newGroups;
        } else {
          const newGroups = JSON.parse(JSON.stringify(prev));
          newGroups[activeGroupIndex].items = arrayMove(newGroups[activeGroupIndex].items, activeItemIndex, overItemIndex);
          return newGroups;
        }
      }

      // Dropping item over an empty group
      if (isOverGroup) {
        const overGroupIndex = prev.findIndex(g => g.id === overId);
        if (overGroupIndex === -1) return prev;

        if (activeGroupIndex !== overGroupIndex) {
          const newGroups = JSON.parse(JSON.stringify(prev));
          const [movedItem] = newGroups[activeGroupIndex].items.splice(activeItemIndex, 1);
          newGroups[overGroupIndex].items.push(movedItem);
          return newGroups;
        }
      }

      return prev;
    });
  };

  const handleDragEnd = (event) => {
    setActiveDragItem(null);
  };

  const savePreferences = async () => {
    // Save to localStorage for immediate local persistence
    localStorage.setItem('sidebar_groups_prefs', JSON.stringify(sidebarGroups));

    if (prefsDocRef) {
      try {
        await setDoc(prefsDocRef, { groups: sidebarGroups }, { merge: true });
        setIsEditing(false);
      } catch (e) {
        console.error("Failed to save sidebar preferences", e);
        setIsEditing(false); // still exit edit mode
      }
    } else {
      setIsEditing(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) savePreferences();
    else setIsEditing(true);
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
        footer={{
          label: isEditing ? "Save Menu" : "Customize Menu",
          icon: isEditing ? Save : Settings,
          onClick: toggleEditMode
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
