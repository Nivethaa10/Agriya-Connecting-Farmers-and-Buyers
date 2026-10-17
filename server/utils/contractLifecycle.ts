import { Types } from 'mongoose';
import {
  IContractRelationship,
  LifecycleStage,
  RelationshipStatus,
} from '../models/ContractRelationship.ts';

const growthStages: LifecycleStage[] = [
  'sowing',
  'vegetative',
  'flowering_fruiting',
  'mature_harvest_ready',
];

const progressStageNames: Record<string, LifecycleStage> = {
  'sowing & emergence': 'sowing',
  'vegetative growth & tiller development': 'vegetative',
  'flowering & pod / grain formation': 'flowering_fruiting',
  'ripening & mature harvest ready': 'mature_harvest_ready',
};

const progressBounds: Record<string, [number, number]> = {
  sowing: [10, 24],
  vegetative: [25, 49],
  flowering_fruiting: [50, 69],
  mature_harvest_ready: [70, 79],
};

export function growthStageForProgress(stageName: string): LifecycleStage | undefined {
  return progressStageNames[stageName.trim().toLowerCase()];
}

export function validateGrowthUpdate(
  relationship: IContractRelationship,
  stage: LifecycleStage,
  progressPercentage: number
): string | undefined {
  if (relationship.status !== 'active') {
    return 'Lifecycle updates are only allowed for active contract relationships.';
  }
  if (!growthStages.includes(stage)) {
    return 'Select a valid cultivation stage.';
  }
  if (!Number.isFinite(progressPercentage) || progressPercentage < 0 || progressPercentage > 100) {
    return 'Progress percentage must be between 0 and 100.';
  }

  const currentIndex = growthStages.indexOf(relationship.lifecycleStage);
  const nextIndex = growthStages.indexOf(stage);
  if (currentIndex < 0 || nextIndex < currentIndex || nextIndex > currentIndex + 1) {
    return 'Cultivation stages must advance one stage at a time and cannot move backwards.';
  }
  if (progressPercentage < relationship.progressPercentage) {
    return 'Progress percentage cannot be reduced.';
  }
  const [minimum, maximum] = progressBounds[stage];
  if (progressPercentage < minimum || progressPercentage > maximum) {
    return `Progress for this cultivation stage must be between ${minimum} and ${maximum} percent.`;
  }

  return undefined;
}

export function recordLifecycleUpdate(
  relationship: IContractRelationship,
  newStage: LifecycleStage,
  progressPercentage: number,
  actorId: Types.ObjectId,
  actorRole: 'farmer' | 'buyer',
  notes = '',
  newStatus: RelationshipStatus = relationship.status
): void {
  const previousStage = relationship.lifecycleStage;
  const previousStatus = relationship.status;
  relationship.lifecycleStage = newStage;
  relationship.progressPercentage = progressPercentage;
  relationship.status = newStatus;
  relationship.lifecycleHistory.push({
    previousStage,
    newStage,
    progressPercentage,
    previousStatus,
    newStatus,
    actorId,
    actorRole,
    notes: notes.trim(),
    recordedAt: new Date(),
  });
}
