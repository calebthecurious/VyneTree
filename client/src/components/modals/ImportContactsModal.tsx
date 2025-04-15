import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ImportContactsModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => void;
}

const ImportContactsModal = ({ userId, isOpen, onClose, onImport }: ImportContactsModalProps) => {
  const { toast } = useToast();
  const [importMethod, setImportMethod] = useState<string>('csv');
  const [csvData, setCsvData] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleImport = () => {
    setIsLoading(true);
    
    // This is a simplified mock implementation
    // In a real app, this would send the data to the server for processing
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful import
      const mockImportedContacts = [
        { name: 'John Smith', relationshipTier: 'Good' },
        { name: 'Jane Doe', relationshipTier: 'Best' },
        { name: 'Bob Johnson', relationshipTier: 'Tribe' }
      ];
      
      onImport(mockImportedContacts);
      
      toast({
        title: "Contacts imported",
        description: `Successfully imported ${mockImportedContacts.length} contacts.`,
      });
      
      handleClose();
    }, 1500);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleClose = () => {
    setCsvData('');
    setFile(null);
    setImportMethod('csv');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Import your contacts from a file or connect to third-party services.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="csv" onValueChange={setImportMethod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">CSV File</TabsTrigger>
            <TabsTrigger value="google">Google Contacts</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <Input 
                id="csv-file" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-500">
                Your CSV should have columns for name, email, and optionally relationship category.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="csv-data">Or paste CSV data</Label>
              <Textarea 
                id="csv-data" 
                placeholder="name,email,relationship&#10;John Doe,john@example.com,Best Friend"
                className="min-h-[100px]"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="google" className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center space-y-4 p-6 border rounded-md">
              <svg className="h-12 w-12 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L10 12L14 8M18 8L14 12L18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-center text-sm">
                Connect to your Google account to import contacts.
                <br />We'll only access your contacts data.
              </p>
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Connect Google Contacts
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="relationship-tier">Default Relationship Tier</Label>
              <RadioGroup defaultValue="Tribe" className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intimate" id="intimate" />
                  <Label htmlFor="intimate">Intimate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Best" id="best" />
                  <Label htmlFor="best">Best Friend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="good" />
                  <Label htmlFor="good">Good Friend</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tribe" id="tribe" />
                  <Label htmlFor="tribe">Tribe</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manual-entry">Enter contacts (one per line)</Label>
              <Textarea 
                id="manual-entry" 
                placeholder="John Doe&#10;Jane Smith&#10;Bob Johnson"
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import Contacts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsModal;
