/**
 * curriculumPathway.ts
 * Re-exports multi-stage curriculum data for backward compatibility.
 */

export * from './curriculumData';
import { ALL_CURRICULUM_PATHWAYS, type CurriculumPathway } from './curriculumData';

export const CURRICULUM_PATHWAY: CurriculumPathway = ALL_CURRICULUM_PATHWAYS[0];
