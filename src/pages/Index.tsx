import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ROProvider } from '@/contexts/ROContext';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { FloatingActionButton } from '@/components/mobile/FloatingActionButton';
import { ROsTab } from '@/components/tabs/ROsTab';
import { SummaryTab } from '@/components/tabs/SummaryTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { QuickAddSheet } from '@/components/sheets/QuickAddSheet';
import { ScanROSheet } from '@/components/sheets/ScanROSheet';
import type { RepairOrder } from '@/types/ro';

function ROTrackerApp() {
  const [activeTab, setActiveTab] = useState<'ros' | 'summary' | 'settings'>('ros');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [editingRO, setEditingRO] = useState<RepairOrder | undefined>();

  const handleEditRO = (ro: RepairOrder) => {
    setEditingRO(ro);
    setShowQuickAdd(true);
  };

  const handleCloseQuickAdd = () => {
    setShowQuickAdd(false);
    setEditingRO(undefined);
  };

  const handleScanApply = (data: any) => {
    // Apply scanned data to a new RO
    setShowScan(false);
    setShowQuickAdd(true);
    // The data would be passed through state in a real implementation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Area */}
      <main className="h-[calc(100vh-var(--tab-bar-height)-var(--safe-area-inset-bottom))]">
        {activeTab === 'ros' && <ROsTab onEditRO={handleEditRO} />}
        {activeTab === 'summary' && <SummaryTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Floating Action Button - only on ROs tab */}
      {activeTab === 'ros' && (
        <FloatingActionButton
          onClick={() => setShowQuickAdd(true)}
          icon={<Plus className="h-6 w-6" />}
          label="Quick Add"
        />
      )}

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Quick Add Sheet */}
      <QuickAddSheet
        isOpen={showQuickAdd}
        onClose={handleCloseQuickAdd}
        editingRO={editingRO}
        onScanPhoto={() => {
          setShowQuickAdd(false);
          setShowScan(true);
        }}
      />

      {/* Scan RO Sheet */}
      <ScanROSheet
        isOpen={showScan}
        onClose={() => setShowScan(false)}
        onApply={handleScanApply}
      />
    </div>
  );
}

const Index = () => {
  return (
    <ROProvider>
      <ROTrackerApp />
    </ROProvider>
  );
};

export default Index;
