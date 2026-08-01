import { appDataService, createAppDataService } from '@/services/appDataService';
import { initializeFirebase, isFirebaseConfigured } from '@/services/firebase/config';
import { mockAppRepository } from '@/repositories/mockAppRepository';
import { firebaseAppRepository } from '@/repositories/firebaseAppRepository';

export type DataSourceMode = 'mock' | 'firebase';

let currentMode: DataSourceMode = 'mock';

export const getDataSourceMode = () => currentMode;

export const setDataSourceMode = (mode: DataSourceMode) => {
  currentMode = mode;

  if (mode === 'firebase') {
    if (isFirebaseConfigured()) {
      appDataService.setRepository(firebaseAppRepository);
      return;
    }

    currentMode = 'mock';
    appDataService.setRepository(mockAppRepository);
  }

  if (mode === 'mock') {
    appDataService.setRepository(mockAppRepository);
  }
};

export const initializeDataSource = async () => {
  const result = await initializeFirebase();

  if (result.ready) {
    setDataSourceMode('firebase');
  } else {
    setDataSourceMode('mock');
  }

  return { mode: getDataSourceMode(), ready: result.ready };
};

export const createDataService = () => createAppDataService();
