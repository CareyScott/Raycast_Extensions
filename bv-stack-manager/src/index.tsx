import React, { useEffect, useState } from "react";
import { Action, ActionPanel, Color, Icon, List, showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { BV_SERVICES } from "./config";
import { ServiceStatus } from "./types";
import LogViewer from "./LogViewer";
import {
  getAllServiceStatuses,
  startService,
  stopService,
  restartService,
  startAllServices,
  stopAllServices,
} from "./utils";

export default function Command() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadStatuses() {
    setIsLoading(true);
    try {
      const newStatuses = await getAllServiceStatuses(BV_SERVICES);
      setStatuses(newStatuses);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to load service statuses",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStatuses();
  }, []);

  async function handleStartService(serviceName: string) {
    const service = BV_SERVICES.find((s) => s.name === serviceName);
    if (!service) return;

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Starting ${service.displayName}...`,
    });

    try {
      await startService(service);
      toast.style = Toast.Style.Success;
      toast.title = `${service.displayName} started successfully`;
      await loadStatuses();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = `Failed to start ${service.displayName}`;
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function handleStopService(serviceName: string) {
    const service = BV_SERVICES.find((s) => s.name === serviceName);
    if (!service) return;

    if (
      await confirmAlert({
        title: `Stop ${service.displayName}?`,
        message: "This will terminate the running service and all its processes.",
        primaryAction: {
          title: "Stop Service",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: `Stopping ${service.displayName}...`,
      });

      try {
        await stopService(service);
        toast.style = Toast.Style.Success;
        toast.title = `${service.displayName} stopped successfully`;
        await loadStatuses();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = `Failed to stop ${service.displayName}`;
        toast.message = error instanceof Error ? error.message : String(error);
      }
    }
  }

  async function handleRestartService(serviceName: string) {
    const service = BV_SERVICES.find((s) => s.name === serviceName);
    if (!service) return;

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `Restarting ${service.displayName}...`,
    });

    try {
      await restartService(service);
      toast.style = Toast.Style.Success;
      toast.title = `${service.displayName} restarted successfully`;
      await loadStatuses();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = `Failed to restart ${service.displayName}`;
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function handleStartAll() {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Starting all services...",
    });

    try {
      // Get current statuses to show which ones were skipped
      const currentStatuses = await getAllServiceStatuses(BV_SERVICES);
      const alreadyRunning = currentStatuses.filter((s) => s.running).map((s) => s.name);

      await startAllServices(BV_SERVICES);

      const newStatuses = await getAllServiceStatuses(BV_SERVICES);
      const nowRunning = newStatuses.filter((s) => s.running).length;

      toast.style = Toast.Style.Success;
      if (alreadyRunning.length > 0) {
        toast.title = `Started services (${alreadyRunning.length} already running)`;
        toast.message = `${nowRunning}/${BV_SERVICES.length} services running`;
      } else {
        toast.title = "All services started successfully";
        toast.message = `${nowRunning}/${BV_SERVICES.length} services running`;
      }
      await loadStatuses();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to start all services";
      toast.message = error instanceof Error ? error.message : String(error);
    }
  }

  async function handleStopAll() {
    if (
      await confirmAlert({
        title: "Stop All Services?",
        message: "This will terminate all running BV services.",
        primaryAction: {
          title: "Stop All",
          style: Alert.ActionStyle.Destructive,
        },
      })
    ) {
      const toast = await showToast({
        style: Toast.Style.Animated,
        title: "Stopping all services...",
      });

      try {
        await stopAllServices(BV_SERVICES);
        toast.style = Toast.Style.Success;
        toast.title = "All services stopped successfully";
        await loadStatuses();
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to stop all services";
        toast.message = error instanceof Error ? error.message : String(error);
      }
    }
  }

  const runningCount = statuses.filter((s) => s.running).length;
  const totalCount = BV_SERVICES.length;

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search services...">
      <List.Section title={`Services (${runningCount}/${totalCount} running)`}>
        {BV_SERVICES.map((service) => {
          const status = statuses.find((s) => s.name === service.name);
          const isRunning = status?.running || false;

          return (
            <List.Item
              key={service.name}
              title={service.displayName}
              subtitle={`Port ${service.port}`}
              accessories={[
                {
                  tag: {
                    value: isRunning ? "Running" : "Stopped",
                    color: isRunning ? Color.Green : Color.Red,
                  },
                },
                ...(status?.pid ? [{ text: `PID: ${status.pid}` }] : []),
              ]}
              icon={{
                source: Icon.Circle,
                tintColor: isRunning ? Color.Green : Color.Red,
              }}
              actions={
                <ActionPanel>
                  {!isRunning ? (
                    <Action title="Start Service" icon={Icon.Play} onAction={() => handleStartService(service.name)} />
                  ) : (
                    <>
                      <Action
                        title="Stop Service"
                        icon={Icon.Stop}
                        style={Action.Style.Destructive}
                        onAction={() => handleStopService(service.name)}
                      />
                      <Action
                        title="Restart Service"
                        icon={Icon.ArrowClockwise}
                        onAction={() => handleRestartService(service.name)}
                      />
                    </>
                  )}
                  <Action.Push
                    title="View Recent Errors"
                    icon={Icon.ExclamationMark}
                    target={<LogViewer service={service} />}
                    shortcut={{ modifiers: ["cmd"], key: "l" }}
                  />
                  <Action title="Refresh Status" icon={Icon.ArrowClockwise} onAction={loadStatuses} />
                  <Action.OpenInBrowser title="Open Service" url={`http://localhost:${service.port}`} />
                  <Action.ShowInFinder title="Show in Finder" path={service.path} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.Section title="Bulk Actions">
        <List.Item
          title="Start All Services"
          icon={{ source: Icon.Play, tintColor: Color.Green }}
          actions={
            <ActionPanel>
              <Action title="Start All Services" icon={Icon.Play} onAction={handleStartAll} />
            </ActionPanel>
          }
        />
        <List.Item
          title="Stop All Services"
          icon={{ source: Icon.Stop, tintColor: Color.Red }}
          actions={
            <ActionPanel>
              <Action
                title="Stop All Services"
                icon={Icon.Stop}
                style={Action.Style.Destructive}
                onAction={handleStopAll}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="Refresh Status"
          icon={{ source: Icon.ArrowClockwise, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action title="Refresh Status" icon={Icon.ArrowClockwise} onAction={loadStatuses} />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
