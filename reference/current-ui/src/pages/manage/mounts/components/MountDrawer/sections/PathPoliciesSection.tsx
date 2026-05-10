import type { Dispatch, SetStateAction } from 'react';
import { ManageSectionCard } from '../../../../components';
import { SourcePathPolicyEditor } from '../../../../source-governance-fields';
import type { MountFormState } from '../../../types';

interface PathPoliciesSectionProps {
  formState: MountFormState;
  setFormState: Dispatch<SetStateAction<MountFormState>>;
  isSaving: boolean;
  description: string;
}

export function PathPoliciesSection({
  formState,
  setFormState,
  isSaving,
  description,
}: PathPoliciesSectionProps) {
  return (
    <ManageSectionCard
      title="来源路径策略"
      description={description}
    >
      <SourcePathPolicyEditor
        value={formState.pathPolicies}
        onChange={(next) =>
          setFormState((prev) => ({ ...prev, pathPolicies: next }))
        }
        disabled={isSaving}
      />
    </ManageSectionCard>
  );
}
