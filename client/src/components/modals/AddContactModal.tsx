import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import useContacts from '@/hooks/useContacts';
import { InsertContact } from '@shared/schema';

interface AddContactModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const AddContactModal = ({ userId, isOpen, onClose }: AddContactModalProps) => {
  const { toast } = useToast();
  const { createContact, isCreating } = useContacts({ userId });
  
  const [formData, setFormData] = useState<Partial<InsertContact>>({
    userId,
    name: '',
    relationshipTier: 'Tribe',
    notes: '',
    photo: null
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (value: string) => {
    if (value === 'Intimate' || value === 'Best' || value === 'Good' || value === 'Tribe') {
      setFormData(prev => ({ ...prev, relationshipTier: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Contact name is required",
        variant: "destructive"
      });
      return;
    }
    
    createContact(formData as InsertContact);
    handleClose();
  };
  
  const handleClose = () => {
    setFormData({
      userId,
      name: '',
      relationshipTier: 'Tribe',
      notes: '',
      photo: null
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact to your relationship network.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Contact name"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Relationship
              </Label>
              <RadioGroup 
                value={formData.relationshipTier} 
                onValueChange={handleRadioChange}
                className="col-span-3 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intimate" id="intimate" />
                  <Label htmlFor="intimate">Intimate Circle (1-5)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Best" id="best" />
                  <Label htmlFor="best">Best Friends (5-15)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Good" id="good" />
                  <Label htmlFor="good">Good Friends (15-50)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Tribe" id="tribe" />
                  <Label htmlFor="tribe">Tribe (50-150)</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">
                Photo URL
              </Label>
              <Input
                id="photo"
                name="photo"
                value={formData.photo || ''}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="https://example.com/photo.jpg (optional)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Add notes about this contact (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.name}>
              {isCreating ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;