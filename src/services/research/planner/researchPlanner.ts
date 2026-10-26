// Research Planner Agent - Phase 2
import { MedicalEntity, ResearchTask } from '../../../types/research';

export class ResearchPlanner {
  private static MAX_RESEARCH_TASKS = 10;

  /**
   * Evaluates extracted medical entities and formulates targeted, objective research tasks.
   * Explicitly avoids diagnostic or treatment queries.
   */
  public planResearch(entities: MedicalEntity[]): ResearchTask[] {
    const tasks: ResearchTask[] = [];

    for (const entity of entities) {
      if (tasks.length >= ResearchPlanner.MAX_RESEARCH_TASKS) break;

      switch (entity.type) {
        case 'condition': {
          tasks.push({
            id: `task-${tasks.length + 1}`,
            entityId: entity.id,
            entityName: entity.name,
            type: 'condition',
            query: `${entity.name} patient education clinical overview official health organization`,
            priority: 'high',
            status: 'pending'
          });
          break;
        }

        case 'test': {
          tasks.push({
            id: `task-${tasks.length + 1}`,
            entityId: entity.id,
            entityName: entity.name,
            type: 'test',
            query: `${entity.name} test official medical information clinical measurement`,
            priority: 'high',
            status: 'pending'
          });
          break;
        }

        case 'medicine': {
          // Task A: Approved general indications and mechanism
          tasks.push({
            id: `task-${tasks.length + 1}`,
            entityId: entity.id,
            entityName: entity.name,
            type: 'medicine_use',
            query: `${entity.name} official prescribing information indications approved use`,
            priority: 'high',
            status: 'pending'
          });

          // Task B: General regulatory precautions & patient safety
          if (tasks.length < ResearchPlanner.MAX_RESEARCH_TASKS) {
            tasks.push({
              id: `task-${tasks.length + 1}`,
              entityId: entity.id,
              entityName: entity.name,
              type: 'safety',
              query: `${entity.name} important general precautions warnings official labeling`,
              priority: 'high',
              status: 'pending'
            });
          }
          break;
        }

        case 'medical_term': {
          tasks.push({
            id: `task-${tasks.length + 1}`,
            entityId: entity.id,
            entityName: entity.name,
            type: 'medical_term',
            query: `${entity.name} medical terminology definition official health glossary`,
            priority: 'medium',
            status: 'pending'
          });
          break;
        }

        default:
          break;
      }
    }

    // Safety check: verify no queries request personalized medical advice or treatment choices
    return tasks.map(t => ({
      ...t,
      query: this.sanitizeQuery(t.query)
    }));
  }

  /**
   * Sanitizes research queries to prevent treatment recommendation prompts.
   */
  private sanitizeQuery(query: string): string {
    const prohibitedInQueries = [
      /should\s+patient\s+take/gi,
      /what\s+treatment\s+should/gi,
      /cure\s+for/gi,
      /how\s+to\s+prescribe/gi,
      /diagnose\s+patient/gi
    ];

    let sanitized = query;
    for (const pattern of prohibitedInQueries) {
      sanitized = sanitized.replace(pattern, 'general medical overview');
    }
    return sanitized.trim();
  }
}
