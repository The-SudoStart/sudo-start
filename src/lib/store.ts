import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Package } from '@/types';
import { clientContainer } from '@/infrastructure/config/client-container';

const bucketUseCase = clientContainer.manageBucketUseCase;

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
      return { bucket: bucketUseCase.addPackageToBucket(state.bucket, pkg) };
    }),

  removeFromBucket: (pkgId) =>
    set((state) => ({
      bucket: bucketUseCase.removePackageFromBucket(state.bucket, pkgId),
    })),

  updatePackageVersion: (pkgId, version) =>
    set((state) => ({
      bucket: bucketUseCase.updatePackageVersion(state.bucket, pkgId, version),
    })),

  updatePackageNote: (pkgId, note) =>
    set((state) => ({
      bucket: bucketUseCase.updatePackageNote(state.bucket, pkgId, note),
    })),

  addDefaultAppsToBucket: () =>
    set((state) => {
      return {
        bucket: bucketUseCase.addPackagesToBucket(
          state.bucket,
          bucketUseCase.getDefaultPackages(),
        ),
      };
    }),

  loadPreset: (packageIds: string[]) =>
    set((state) => {
      return {
        bucket: bucketUseCase.addPackagesToBucket(
          state.bucket,
          bucketUseCase.getPackagesByIds(packageIds),
        ),
      };
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
      const data = JSON.parse(json) as { id: string; selectedVersion?: string; versionNote?: string }[];
      set({ bucket: bucketUseCase.importBucketEntries(data) });
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
      clearBucket: () => set((state) => ({
        bucket: bucketUseCase.clearBucket(state.bucket),
      })),
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
