import Settings from "lucide-react/dist/esm/icons/settings";
import Save from "lucide-react/dist/esm/icons/save";
import X from "lucide-react/dist/esm/icons/x";
import ListOrdered from "lucide-react/dist/esm/icons/list-ordered";
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';
import AppSidebar from './index';




import SidebarOrderModal from './SidebarOrderModal';

export default function SidebarGadget(props) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarGroups, setSidebarGroups] = useState(props.groups || []);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
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

    const usedItemIds = new Set();

    const hydratedGroups = savedGroups
      .filter(savedGroup => savedGroup.id !== 'favorites' && savedGroup.id !== 'admin_favorites')
      .map(savedGroup => {
        const origGroup = originalGroups.find(g => g.id === savedGroup.id);
        if (!origGroup) return null; // Discard obsolete groups that don't exist in originalGroups
        const hydratedItems = (savedGroup.items || [])
          .map(savedItem => {
            const item = allItems.get(savedItem.id) || null;
            if (item && savedGroup.id !== 'favorites') usedItemIds.add(item.id);
            return item;
          })
          .filter(Boolean);

        return {
          ...origGroup,
          id: savedGroup.id,
          items: hydratedItems
        };
      })
      .filter(Boolean);

    // Add any missing groups
    originalGroups.forEach(origGroup => {
      if (!hydratedGroups.find(g => g.id === origGroup.id)) {
        hydratedGroups.push({ ...origGroup, items: [] });
      }
    });

    // Add any missing items
    originalGroups.forEach(origGroup => {
      if (origGroup.items) {
        origGroup.items.forEach(origItem => {
          if (!usedItemIds.has(origItem.id)) {
            const targetGroup = hydratedGroups.find(g => g.id === origGroup.id);
            if (targetGroup) {
              if (!targetGroup.items) targetGroup.items = [];
              targetGroup.items.push(origItem);
            }
          }
        });
      }
    });

    return hydratedGroups;
  };

  useEffect(() => {
    async function loadPreferences() {
      const currentPrefsDocRef = user ? doc(db, 'users', user.uid, 'preferences', storageKey) : null;
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
          injectFavoritesGroup(props.groups);
        }
      } catch (e) {
        if (!localPrefs) injectFavoritesGroup(props.groups);
      }
    }
    loadPreferences();
  }, [user, props.groups]);

  const injectFavoritesGroup = (initialGroups) => {
    setSidebarGroups(initialGroups);
  };

  const savePreferences = async (groupsToSave = sidebarGroups, exitEditMode = true) => {
    const serializedGroups = groupsToSave.map(g => {
      const groupData = { id: g.id };
      if (g.label !== undefined) groupData.label = g.label;
      if (g.emoji !== undefined) groupData.emoji = g.emoji;
      groupData.items = (g.items || []).map(i => {
        const itemData = { id: i.id, label: i.label || '' };
        if (i.path !== undefined) itemData.path = i.path;
        return itemData;
      });
      return groupData;
    });

    localStorage.setItem(storageKey, JSON.stringify(serializedGroups));

    if (prefsDocRef) {
      try {
        await setDoc(prefsDocRef, { groups: serializedGroups }, { merge: true });
      } catch (e) {
        console.error("Failed to save sidebar preferences", e);
      }
    }
    if (exitEditMode) setIsEditing(false);
  };

  const handleOrderSave = async (newGroups) => {
    setSidebarGroups(newGroups);
    await savePreferences(newGroups, false);
  };

  const handleToggleFavorite = (itemId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
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
      if (!favGroup) return prev;
      const isFav = favGroup.items.some(i => i.id === itemId);
      if (isFav) {
        favGroup.items = favGroup.items.filter(i => i.id !== itemId);
      } else {
        favGroup.items.push(targetItem);
      }
      setTimeout(() => savePreferences(newGroups, false), 0);
      return newGroups;
    });
  };

  const toggleEditMode = () => {
    if (isEditing) savePreferences(sidebarGroups);
    else setIsEditing(true);
  };

  const resetToDefault = async () => {
    const defaultGroups = [...props.groups];
    setSidebarGroups(defaultGroups);
    await savePreferences(defaultGroups);
    setIsEditing(false);
  };

  const displayGroups = sidebarGroups.map(group => ({
    ...group,
    items: (group.items || []).map(item => {
      if (item.id === 'messages' || item.id === 'Mensajes') {
        return { ...item, pulse: true };
      }
      return item;
    })
  }));

  return (
    <>
      <SidebarOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        groups={displayGroups}
        onSave={(newGroups) => {
          handleOrderSave(newGroups);
          if (props.onOrderSave) props.onOrderSave(newGroups);
        }}
      />

      <AppSidebar 
        {...props} 
        groups={displayGroups}
        pinnedItems={props.pinnedItems || []}
        isEditing={false}
      />
    </>
  );
}