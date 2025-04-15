import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contactsApi } from '@/lib/api';
import { InsertContact } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AddContactModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const AddContactModal = ({ userId, isOpen, onClose }: AddContactModalProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<InsertContact>>({
    userId,
    name: '',
    relationshipTier: 'Tribe',
    photo: '',
    notes: ''
  });
  
  const createContactMutation = useMutation({
    mutationFn: (contactData: InsertContact) => contactsApi.createContact(contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/contacts/recent`] });
      toast({
        title: "Contact added",
        description: "New contact has been successfully added.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, relationshipTier: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Contact name is required.",
        variant: "destructive",
      });
      return;
    }
    
    createContactMutation.mutate(formData as InsertContact);
  };
  
  const handleClose = () => {
    setFormData({
      userId,
      name: '',
      relationshipTier: 'Tribe',
      photo: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Enter the details of your new connection. Click save when you're done.
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
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="relationshipTier" className="text-right">
                Relationship
              </Label>
              <Select
                value={formData.relationshipTier}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Intimate">Intimate</SelectItem>
                    <SelectItem value="Best">Best Friend</SelectItem>
                    <SelectItem value="Good">Good Friend</SelectItem>
                    <SelectItem value="Tribe">Tribe</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                placeholder="https://example.com/photo.jpg"
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
                placeholder="Add some notes about this contact..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createContactMutation.isPending}
            >
              {createContactMutation.isPending ? 'Saving...' : 'Save Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactModal;
