import { LABS_CATALOG, type LabCatalogItem } from './labsCatalogData';

export type LabModule = LabCatalogItem;
export type LabId = LabCatalogItem['id'];
export type LabAccent = LabCatalogItem['accent'];

export const LAB_MODULES: LabModule[] = LABS_CATALOG;

export const getLab = (id: string | undefined): LabModule | undefined =>
  LAB_MODULES.find((lab) => lab.id === id);
