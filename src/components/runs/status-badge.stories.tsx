import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "@/components/runs/status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Runs/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  args: { status: "running" },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Running: Story = {};
export const Queued: Story = { args: { status: "queued" } };
export const AwaitingApproval: Story = { args: { status: "awaiting_approval" } };
export const Completed: Story = { args: { status: "completed" } };
export const Failed: Story = { args: { status: "failed" } };
export const Cancelled: Story = { args: { status: "cancelled" } };
export const UnknownFallback: Story = { args: { status: "mystery" } };
