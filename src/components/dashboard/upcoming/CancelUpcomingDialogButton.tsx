import { Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import React from "react";
import { Trash2Icon } from "lucide-react";

type Props = {
    onProceed: () => void;
    onCancel: () => void;
}

export const DeleteUpcomingSlotButton: React.FC<Props> = ({
    onProceed,
    onCancel,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const openChannelDialog = () => setIsOpen(true);
    const handleClose = () => {
        onCancel();
        setIsOpen(false)
    };
    const handleProceed = () => {
        onProceed();
        setIsOpen(false);
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"
                    onClick={openChannelDialog}
                >
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md">
                <DialogTitle className="text-lg font-bold mb-4">Warning for Deletion</DialogTitle>
                <div className="space-y-4">
                    <p>
                        This action cannot be undone. Are you sure you want to proceed?
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button variant="destructive" onClick={handleProceed}>Proceed</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}