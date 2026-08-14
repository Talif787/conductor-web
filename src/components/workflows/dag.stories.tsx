import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { WorkflowDag } from "@/components/workflows/dag";

const steps = [
  { step_id: "retrieve", name: "Retrieve", tool_id: "tool-1", depends_on: [] },
  { step_id: "summarize", name: "Summarize", tool_id: "tool-2", depends_on: ["retrieve"] },
  { step_id: "publish", name: "Publish", tool_id: "tool-3", depends_on: ["summarize"] },
];

const meta: Meta<typeof WorkflowDag> = {
  title: "Workflows/WorkflowDag",
  component: WorkflowDag,
};
export default meta;

type Story = StoryObj<typeof WorkflowDag>;

export const Chain: Story = {
  args: { steps, toolName: (id: string) => id.toUpperCase() },
};

export const SingleStep: Story = {
  args: { steps: steps.slice(0, 1), toolName: (id: string) => id.toUpperCase() },
};

export const Empty: Story = {
  args: { steps: [] },
};
