import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Package } from '@/types';
import { getDefaultApps, appCatalog } from './apps';
import { isValidVersion } from './security';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      os: null,
      shell: null,
      bucket: [],
      generatedScript: '',
      currentStep: 'boot',
      isChatOpen: false,

  // Actions
  setOS: (os) => set({ os }),
  setShell: (shell) => set({ shell }),

  addToBucket: (pkg) =>
    set((state) => {
      const exists = state.bucket.find((p) => p.id === pkg.id);
      if (exists) return state;
      return { bucket: [...state.bucket, pkg] };
    }),

  removeFromBucket: (pkgId) =>
    set((state) => ({
      bucket: state.bucket.filter((p) => p.id !== pkgId),
    })),

  updatePackageVersion: (pkgId, version) =>
    set((state) => ({
      bucket: state.bucket.map((p) =>
        p.id === pkgId ? { ...p, selectedVersion: version } : p
      ),
    })),

  updatePackageNote: (pkgId, note) =>
    set((state) => ({
      bucket: state.bucket.map((p) =>
        p.id === pkgId ? { ...p, versionNote: note } : p
      ),
    })),

  addDefaultAppsToBucket: () =>
    set((state) => {
      const defaultApps = getDefaultApps();
      const newBucket = [...state.bucket];
      defaultApps.forEach((app) => {
        if (!newBucket.find((p) => p.id === app.id)) {
          newBucket.push(app);
        }
      });
      return { bucket: newBucket };
    }),

  loadPreset: (packageIds: string[]) =>
    set((state) => {
      const newPkgs = packageIds
        .map((id) => appCatalog.find((p) => p.id === id))
        .filter(Boolean) as Package[];
      const newBucket = [...state.bucket];
      newPkgs.forEach((pkg) => {
        if (!newBucket.find((p) => p.id === pkg.id)) {
          newBucket.push({ ...pkg, selectedVersion: pkg.defaultVersion });
        }
      });
      return { bucket: newBucket };
    }),

  exportBucket: () => {
    const { bucket } = get();
    const data = bucket.map((p) => ({
      id: p.id,
      selectedVersion: p.selectedVersion || p.defaultVersion,
      versionNote: p.versionNote || '',
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sudostart-bucket.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importBucket: (json: string) => {
    try {
      const data: unknown = JSON.parse(json);
      if (!Array.isArray(data) || data.length > 100) return false;
      const newBucket: Package[] = [];
      for (const item of data) {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string' ||
            (item.selectedVersion !== undefined && !isValidVersion(item.selectedVersion)) ||
            (item.versionNote !== undefined &&
              (typeof item.versionNote !== 'string' || item.versionNote.length > 1000))) return false;
        const { id, selectedVersion, versionNote } = item as {
          id: string; selectedVersion?: string; versionNote?: string;
        };
        const pkg = appCatalog.find((p) => p.id === id);
        if (pkg && !newBucket.some((p) => p.id === id)) {
          newBucket.push({
            ...pkg,
            selectedVersion: selectedVersion || pkg.defaultVersion,
            versionNote: versionNote || '',
          });
        }
      }
      set({ bucket: newBucket });
      return true;
    } catch {
      return false;
    }
  },

      setGeneratedScript: (script) => set({ generatedScript: script }),
      setCurrentStep: (step) => {
        const prev = get().currentStep;
        set({ currentStep: step });
        if (typeof window !== 'undefined' && step !== prev) {
          window.history.pushState({ step }, '', `#${step}`);
        }
      },
      goBack: () => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      },
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      clearBucket: () => set({ bucket: [] }),
    }),
    {
      name: 'sudostart-storage',
      partialize: (state) => ({
        os: state.os,
        shell: state.shell,
        bucket: state.bucket,
        currentStep: state.currentStep,
      }),
    }
  )
);
