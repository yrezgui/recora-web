// @flow
import {
  map, isEmpty, compact, zip, flow, filter, get, concat, set, groupBy, omit, fromPairs, uniq,
  propertyOf,
} from 'lodash/fp';
import uuid from 'uuid';
import { STORAGE_ACTION_SAVE, STORAGE_ACTION_REMOVE, STORAGE_LOCAL } from '../../types';
import type { // eslint-disable-line
  StorageOperation, Document, StorageInterface, LocalStorageLocation, StorageAccount,
} from '../../types';
import type { PromiseStorage } from './promiseStorage';


const generateStorageKey = () => uuid.v4();

export default (storage: PromiseStorage): StorageInterface => {
  const loadDocuments = async (account: StorageAccount): Promise<LocalStorageLocation[]> => {
    const item = await storage.getItem(account.id);
    if (!item) return [];
    const items = JSON.parse(item);
    return map(set('accountId', account.id), items);
  };

  const loadDocument = async (
    account: StorageAccount,
    storageLocation: LocalStorageLocation
  ): Promise<Document> => {
    const sectionPairs = await storage.multiGet(storageLocation.sectionStorageKeys);
    const sections = map(pair => JSON.parse(pair[1]), sectionPairs);
    const document = {
      id: null,
      title: storageLocation.title,
      sections,
    };

    return document;
  };

  const updateStore = async (storageOperations: StorageOperation[], state) => {
    const documentsToSave = filter({ action: STORAGE_ACTION_SAVE }, storageOperations);
    const documentsToRemove = filter({ action: STORAGE_ACTION_REMOVE }, storageOperations);

    const now = Date.now();
    const storageLocations = map(storageOperation => {
      const storageKey =
        get(['storageLocation', 'storageKey'], storageOperation) || generateStorageKey();

      return {
        id: storageKey,
        accountId: storageOperation.account.id,
        storageKey,
        title: storageOperation.document.title,
        lastModified: now,
      };
    }, documentsToSave);

    const saveOperations = flow(
      zip(storageLocations),
      map(([storageLocation, storageOperation]) => [
        storageLocation.storageKey,
        JSON.stringify(storageOperation.document),
      ])
    )(documentsToSave);

    const removeOperations = flow(
      map('storageLocation'),
      map('storageKey')
    )(documentsToRemove);

    // Update saved list of documents
    const previousStorageLocation = documentId =>
      get(['documentStorageLocations', documentId], state);

    const newStorageLocationsByDocumentId =
      fromPairs(zip(map('document.id', documentsToSave), storageLocations));

    const documentsByAccountId = groupBy(flow(
      previousStorageLocation,
      get('accountId')
    ), state.documents);

    const accountsToUpdate = flow(
      map('accountId'),
      uniq
    )(storageLocations);

    const newStorageLocationsForAccountsToUpdate = map(flow(
      propertyOf(documentsByAccountId),
      map(docId => newStorageLocationsByDocumentId[docId] || previousStorageLocation(docId))
    ), accountsToUpdate);

    const storageLocationOperations = flow(
      map(value => JSON.stringify(map(omit(['accountId']), value))),
      zip(accountsToUpdate)
    )(newStorageLocationsForAccountsToUpdate);

    await Promise.all(compact([
      !isEmpty(removeOperations) ? storage.multiRemove(removeOperations) : null,
      storage.multiSet(concat(saveOperations, storageLocationOperations)),
    ]));

    return storageLocations;
  };

  return {
    type: STORAGE_LOCAL,
    delay: 1000,
    maxWait: 2000,
    loadDocuments,
    loadDocument,
    updateStore,
  };
};
