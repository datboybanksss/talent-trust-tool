

## Fix: "Add New Client" button + Clients tab routing

### Problem

Two related bugs in `AgentDashboard.tsx`:

1. **Sidebar "Add New Client" button does nothing** — the `<Dialog>` for the new-client form lives inside the `else` branch of `activeView === "executive"`. On initial load `activeView` is `"executive"`, so the dialog isn't mounted. Clicking the sidebar button flips `dialogOpen` to `true`, but there's nothing in the React tree to render.

2. **Clicking "Clients" in the sidebar opens the Add New Client dialog** — view-switching and dialog-opening got crossed during the last edit, so the Clients nav item is firing the dialog handler instead of just switching `activeView` to `"clients"`.

### Fix

Single file: `src/pages/AgentDashboard.tsx`.

1. **Lift the `<Dialog>` out of the conditional view branches** so it's always mounted regardless of `activeView`. Place it at the top level of the page's returned JSX (sibling to the view switcher), wrapping nothing — it just needs to exist in the tree so `dialogOpen` state has somewhere to render.

2. **Restore the Clients nav handler** to only call `setActiveView("clients")` — no dialog side effects. The sidebar's `onNewClient` prop stays wired exclusively to `setDialogOpen(true)`.

3. **Keep the header "New Client" button inside the Clients view** working — it can either be a plain `<Button onClick={() => setDialogOpen(true)}>` (preferred, since the Dialog is now lifted) or remain a `<DialogTrigger>` if it stays inside the same `<Dialog>` root. Going with the plain button avoids needing two `<Dialog>` wrappers.

### Structure after fix

```text
<AgentDashboard>
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogContent>… new-client form …</DialogContent>
  </Dialog>

  <SidebarProvider>
    <AgentSidebar
      onNewClient={() => setDialogOpen(true)}   ← opens dialog
      setActiveView={setActiveView}             ← switches view, no dialog
      …
    />
    <main>
      {activeView === "executive" && <ExecutiveOverviewInline />}
      {activeView === "clients"   && <ClientsView onAddClient={() => setDialogOpen(true)} />}
      {activeView === "pipeline"  && <DealPipeline />}
      …
    </main>
  </SidebarProvider>
</AgentDashboard>
```

### Verification after change

- Default load (`activeView = "executive"`) → click sidebar **Add New Client** → dialog opens.
- Click sidebar **Clients** → view switches to clients list, dialog stays closed.
- Inside Clients view, header **New Client** button → dialog opens.
- No other views or handlers touched.

### Out of scope

- No schema changes.
- No changes to `AgentSidebar.tsx` (its props contract is already correct).
- No changes to invitation insert logic, archived-at filtering, or `RemoveClientDialog`.
- Work Stream 6 (mock-data purge) remains paused pending your per-location decisions.

