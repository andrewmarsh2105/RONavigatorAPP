import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChevronDown, ChevronUp, X, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';
import { LineItemEditor, createEmptyLine } from '@/components/mobile/LineItemEditor';
import { Chip } from '@/components/mobile/Chip';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { ScanROSheet } from '@/components/sheets/ScanROSheet';
import { useRO } from '@/contexts/ROContext';
import type { LaborType, ROLine } from '@/types/ro';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AddRO() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, addRO, updateRO, ros } = useRO();
  
  // Get editing RO from location state
  const editingROId = (location.state as { editingROId?: string })?.editingROId;
  const editingRO = editingROId ? ros.find(r => r.id === editingROId) : undefined;

  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [showAdvisorList, setShowAdvisorList] = useState(false);
  const [showScanSheet, setShowScanSheet] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [roNumber, setRoNumber] = useState(editingRO?.roNumber || '');
  const [advisor, setAdvisor] = useState(editingRO?.advisor || '');
  const [laborType, setLaborType] = useState<LaborType>(editingRO?.laborType || 'customer-pay');
  const [notes, setNotes] = useState(editingRO?.notes || '');
  
  // Lines mode is always on - initialize with existing lines or one empty line
  const [lines, setLines] = useState<ROLine[]>(() => {
    if (editingRO?.lines?.length) {
      return editingRO.lines;
    }
    // If editing an old simple-mode RO, convert it
    if (editingRO && editingRO.paidHours > 0) {
      return [{
        id: Date.now().toString(),
        lineNo: 1,
        description: editingRO.workPerformed || 'General Labor',
        hoursPaid: editingRO.paidHours,
        laborType: editingRO.laborType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }];
    }
    return [createEmptyLine(1)];
  });

  // Lock body scroll when this page is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Calculate total hours from lines
  const totalHours = lines.reduce((sum, line) => sum + line.hoursPaid, 0);

  // Handle scan button click - trigger file input
  const handleScanClick = () => {
    setScanStatus('Opening camera...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection from camera/gallery
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setScanStatus('No file selected');
      return;
    }
    
    setScanStatus(`File selected: ${file.name}`);
    setIsProcessingPhoto(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setScanStatus('Uploading photo...');
    }, 100);
    
    // Read file and show review sheet
    const reader = new FileReader();
    reader.onload = () => {
      setScanStatus('Photo loaded, opening review...');
      setIsProcessingPhoto(false);
      setShowScanSheet(true);
    };
    reader.onerror = () => {
      setScanStatus('Error reading file');
      setIsProcessingPhoto(false);
      toast.error('Failed to read photo');
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Handle scanned data from review sheet
  const handleScanApply = (data: { roNumber?: string; advisor?: string; paidHours?: number; workPerformed?: string }) => {
    setScanStatus('Applying scanned data...');
    
    if (data.roNumber) setRoNumber(data.roNumber);
    if (data.advisor) setAdvisor(data.advisor);
    if (data.paidHours || data.workPerformed) {
      const newLine = createEmptyLine(1);
      newLine.description = data.workPerformed || 'Scanned work';
      newLine.hoursPaid = data.paidHours || 0;
      setLines(prev => [newLine, ...prev.filter(l => l.description || l.hoursPaid > 0)].map((l, i) => ({ ...l, lineNo: i + 1 })));
    }
    
    toast.success('Scanned data applied!');
    setScanStatus('Done');
  };

  const handleSave = (addAnother: boolean = false) => {
    const computedWorkPerformed = lines.map(l => l.description).filter(Boolean).join('\n');
    
    const roData = {
      roNumber,
      advisor,
      paidHours: totalHours,
      laborType,
      workPerformed: computedWorkPerformed,
      notes,
      date: editingRO?.date || new Date().toISOString().split('T')[0],
      photos: editingRO?.photos,
      lines,
      isSimpleMode: false, // Always lines mode now
    };

    if (editingRO) {
      updateRO(editingRO.id, roData);
    } else {
      addRO(roData);
    }

    if (addAnother) {
      // Reset form for another entry
      setRoNumber('');
      setNotes('');
      setLines([createEmptyLine(1)]);
      setShowMoreDetails(false);
    } else {
      navigate(-1);
    }
  };

  const isValid = roNumber.trim() !== '' && 
    advisor.trim() !== '' && 
    totalHours > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-card safe-top">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary font-medium tap-target touch-feedback -ml-2 px-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <h1 className="text-lg font-semibold">
          {editingRO ? 'Edit RO' : 'Add RO'}
        </h1>
        <div className="w-16" /> {/* Spacer for centering */}
      </header>

      {/* Scrollable Content - Single scroll container */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 space-y-6 pb-48">
          {/* Hidden file input for camera/gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />

          {/* Scan RO Photo Button */}
          <div className="space-y-2">
            <button
              onClick={handleScanClick}
              disabled={isProcessingPhoto}
              className={cn(
                "w-full py-4 bg-primary/10 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center gap-3 text-primary font-semibold tap-target touch-feedback relative",
                isProcessingPhoto && "opacity-70"
              )}
            >
              {isProcessingPhoto ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="h-6 w-6" />
                  Scan RO Photo
                </>
              )}
            </button>
            
            {/* Fallback upload button */}
            <label className="w-full py-3 bg-secondary rounded-xl flex items-center justify-center gap-2 text-muted-foreground font-medium tap-target touch-feedback cursor-pointer">
              <Upload className="h-5 w-5" />
              Upload from Gallery
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Debug status (dev mode) */}
            {import.meta.env.DEV && scanStatus && (
              <div className="p-2 bg-muted rounded-lg text-xs font-mono text-muted-foreground">
                Status: {scanStatus}
              </div>
            )}
          </div>

          {/* RO Number */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              RO Number *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={roNumber}
              onChange={(e) => setRoNumber(e.target.value)}
              placeholder="Enter RO number"
              className="w-full h-14 px-4 bg-secondary rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Advisor Selector */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Advisor *
            </label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.advisors.slice(0, 4).map((adv) => (
                <Chip
                  key={adv.id}
                  label={adv.name.split(' ')[0]}
                  selected={advisor === adv.name}
                  onSelect={() => setAdvisor(adv.name)}
                />
              ))}
              {settings.advisors.length > 0 && (
                <Chip
                  label="More..."
                  onSelect={() => setShowAdvisorList(true)}
                />
              )}
            </div>

            {advisor && !settings.advisors.slice(0, 4).find(a => a.name === advisor) && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-xl">
                <span className="font-medium">{advisor}</span>
                <button onClick={() => setAdvisor('')} className="ml-auto">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Labor Type */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Default Labor Type
            </label>
            <SegmentedControl
              options={[
                { value: 'warranty' as LaborType, label: 'Warranty' },
                { value: 'customer-pay' as LaborType, label: 'CP' },
                { value: 'internal' as LaborType, label: 'Internal' },
              ]}
              value={laborType}
              onChange={(value) => setLaborType(value as LaborType)}
            />
          </div>

          {/* Line Items Editor - Always visible */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Line Items
            </label>
            <LineItemEditor
              lines={lines}
              onLinesChange={setLines}
              presets={settings.presets}
              showLaborType={false}
            />
          </div>

          {/* More Details Accordion */}
          <div className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full p-4 flex items-center justify-between touch-feedback"
            >
              <span className="font-medium">More Details</span>
              {showMoreDetails ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            
            <AnimatePresence>
              {showMoreDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full p-4 bg-secondary rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar with Total */}
      <footer className="flex-shrink-0 border-t border-border bg-card safe-bottom">
        {/* Total Hours Display */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
          <span className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="p-4 flex gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={!isValid}
            className={cn(
              'flex-1 py-4 rounded-xl font-semibold tap-target touch-feedback transition-colors',
              isValid
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            Save
          </button>
          {!editingRO && (
            <button
              onClick={() => handleSave(true)}
              disabled={!isValid}
              className={cn(
                'py-4 px-6 rounded-xl font-semibold tap-target touch-feedback border-2 transition-colors',
                isValid
                  ? 'border-primary text-primary'
                  : 'border-muted text-muted-foreground'
              )}
            >
              Save + Add
            </button>
          )}
        </div>
      </footer>

      {/* Advisor List Sheet */}
      <BottomSheet
        isOpen={showAdvisorList}
        onClose={() => setShowAdvisorList(false)}
        title="Select Advisor"
      >
        <div className="p-4 space-y-2">
          {settings.advisors.map((adv) => (
            <button
              key={adv.id}
              onClick={() => {
                setAdvisor(adv.name);
                setShowAdvisorList(false);
              }}
              className={cn(
                'w-full p-4 rounded-xl text-left font-medium tap-target touch-feedback',
                advisor === adv.name ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}
            >
              {adv.name}
            </button>
          ))}
          
          <div className="pt-4">
            <input
              type="text"
              placeholder="Add new advisor..."
              className="w-full h-14 px-4 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setAdvisor(e.currentTarget.value.trim());
                  setShowAdvisorList(false);
                }
              }}
            />
          </div>
        </div>
      </BottomSheet>

      {/* Scan RO Review Sheet */}
      <ScanROSheet
        isOpen={showScanSheet}
        onClose={() => setShowScanSheet(false)}
        onApply={handleScanApply}
      />
    </div>
  );
}