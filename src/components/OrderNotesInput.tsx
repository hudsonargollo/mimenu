import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface OrderNotesInputProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  maxLength?: number;
  className?: string;
}

const OrderNotesInput = ({ 
  notes, 
  onNotesChange, 
  maxLength = 500, 
  className 
}: OrderNotesInputProps) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [error, setError] = useState<string | undefined>();

  // Validate notes length
  const validateNotes = useCallback((value: string): string | undefined => {
    if (value.length > maxLength) {
      return `Las observaciones no pueden exceder ${maxLength} caracteres`;
    }
    return undefined;
  }, [maxLength]);

  // Handle notes change with validation
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Prevent input if it exceeds max length
    if (value.length > maxLength) {
      return;
    }
    
    setLocalNotes(value);
    
    // Validate
    const validationError = validateNotes(value);
    setError(validationError);
    
    // Call parent callback
    onNotesChange(value);
  };

  // Update local state when notes prop changes
  useEffect(() => {
    setLocalNotes(notes);
    const validationError = validateNotes(notes);
    setError(validationError);
  }, [notes, maxLength, validateNotes]);

  // Calculate remaining characters
  const remainingChars = maxLength - localNotes.length;
  const isNearLimit = remainingChars <= 50;
  const isAtLimit = remainingChars <= 0;

  return (
    <Card className={`p-6 shadow-lg border-2 border-orange-100 rounded-2xl ${className || ''}`}>
      <h2 className="font-bold text-xl mb-4 text-primary/70">
        Observaciones del Pedido
        <span className="text-sm font-normal text-muted-foreground ml-2">(Opcional)</span>
      </h2>
      
      <div className="space-y-2">
        <Label htmlFor="order-notes" className="text-sm font-medium">
          Instrucciones especiales o modificaciones
        </Label>
        
        <Textarea
          id="order-notes"
          placeholder="Ej: Açaí sin granola, agregar miel extra, sin leche condensada..."
          value={localNotes}
          onChange={handleNotesChange}
          className={`min-h-[100px] resize-none ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? "notes-error" : "notes-help"}
          maxLength={maxLength}
        />
        
        {error ? (
          <p id="notes-error" className="text-sm font-medium text-red-600">
            {error}
          </p>
        ) : (
          <div id="notes-help" className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Agrega instrucciones especiales para la cocina (opcional)
            </span>
            <span 
              className={`font-medium ${
                isAtLimit 
                  ? 'text-red-600' 
                  : isNearLimit 
                    ? 'text-orange-600' 
                    : 'text-muted-foreground'
              }`}
            >
              Quedan {remainingChars} caracteres
            </span>
          </div>
        )}
        
        {localNotes.trim() && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Vista previa de las observaciones:
            </p>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              {localNotes.trim()}
            </p>
          </div>
        )}

        {/* Hidden input for testing purposes */}
        <input
          type="hidden"
          data-testid="notes-valid"
          value={!error ? "true" : "false"}
          readOnly
        />
        <input
          type="hidden"
          data-testid="notes-length"
          value={localNotes.length}
          readOnly
        />
      </div>
    </Card>
  );
};

export default OrderNotesInput;