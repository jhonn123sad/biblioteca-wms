import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface InterestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName: string;
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido")
    .max(20, "WhatsApp inválido")
    .regex(/^[\d\s()+-]+$/, "Use apenas números"),
  buying_intention: z.string().min(1, "Selecione uma opção"),
  timeframe: z.string().min(1, "Selecione uma opção"),
  preferred_location: z.string().trim().max(200).optional(),
  price_range: z.string().min(1, "Selecione uma opção"),
});

const intentions = [
  { value: "a_vista", label: "À vista" },
  { value: "financiado", label: "Financiado" },
  { value: "permuta", label: "Permuta" },
  { value: "ainda_decidindo", label: "Ainda decidindo" },
];

const timeframes = [
  { value: "imediato", label: "Imediato" },
  { value: "3_6_meses", label: "3 a 6 meses" },
  { value: "mais_6_meses", label: "Mais de 6 meses" },
];

const priceRanges = [
  { value: "ate_2m", label: "Até R$ 2 milhões" },
  { value: "2_a_5m", label: "R$ 2 a 5 milhões" },
  { value: "5_a_10m", label: "R$ 5 a 10 milhões" },
  { value: "acima_10m", label: "Acima de R$ 10 milhões" },
];

export const InterestForm = ({ open, onOpenChange, propertyName }: InterestFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    buying_intention: "",
    timeframe: "",
    preferred_location: "",
    price_range: "",
    name: "",
    whatsapp: "",
  });

  const reset = () => {
    setStep(1);
    setData({
      buying_intention: "",
      timeframe: "",
      preferred_location: "",
      price_range: "",
      name: "",
      whatsapp: "",
    });
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    const parsed = leadSchema.safeParse({
      ...data,
      property_interest: propertyName,
    });
    if (!parsed.success) {
      toast({
        title: "Verifique os campos",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      property_interest: propertyName,
      buying_intention: parsed.data.buying_intention,
      timeframe: parsed.data.timeframe,
      preferred_location: parsed.data.preferred_location || null,
      price_range: parsed.data.price_range,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recebemos seu interesse!",
      description: "O corretor entrará em contato em breve.",
    });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tenho interesse</DialogTitle>
          <DialogDescription>
            {propertyName} · Etapa {step} de 4
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <Label className="text-base">Como pretende comprar?</Label>
            <RadioGroup
              value={data.buying_intention}
              onValueChange={(v) => setData({ ...data, buying_intention: v })}
            >
              {intentions.map((i) => (
                <div key={i.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={i.value} id={i.value} />
                  <Label htmlFor={i.value} className="font-normal cursor-pointer">
                    {i.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={next}
              disabled={!data.buying_intention}
              className="w-full"
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-base">Em quanto tempo pretende comprar?</Label>
            <RadioGroup
              value={data.timeframe}
              onValueChange={(v) => setData({ ...data, timeframe: v })}
            >
              {timeframes.map((t) => (
                <div key={t.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.value} id={t.value} />
                  <Label htmlFor={t.value} className="font-normal cursor-pointer">
                    {t.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex gap-2">
              <Button onClick={back} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={next}
                disabled={!data.timeframe}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base">Faixa de preço de interesse</Label>
              <RadioGroup
                value={data.price_range}
                onValueChange={(v) => setData({ ...data, price_range: v })}
                className="mt-2"
              >
                {priceRanges.map((p) => (
                  <div key={p.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={p.value} id={p.value} />
                    <Label htmlFor={p.value} className="font-normal cursor-pointer">
                      {p.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="loc" className="text-base">
                Localização preferida (opcional)
              </Label>
              <Input
                id="loc"
                placeholder="Ex: Jardins, Itaim, praia..."
                value={data.preferred_location}
                onChange={(e) =>
                  setData({ ...data, preferred_location: e.target.value })
                }
                maxLength={200}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={back} variant="outline" className="flex-1">
                Voltar
              </Button>
              <Button
                onClick={next}
                disabled={!data.price_range}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-base">
                Seu nome
              </Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                maxLength={100}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="wa" className="text-base">
                WhatsApp
              </Label>
              <Input
                id="wa"
                placeholder="(11) 99999-9999"
                value={data.whatsapp}
                onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                maxLength={20}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={back} variant="outline" className="flex-1" disabled={submitting}>
                Voltar
              </Button>
              <Button
                onClick={submit}
                disabled={submitting || !data.name || !data.whatsapp}
                className="flex-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
