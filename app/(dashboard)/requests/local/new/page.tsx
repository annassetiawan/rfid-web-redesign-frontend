"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormStepper } from "@/components/form/stepper";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const steps = [
  { id: "request", label: "Request", helper: "3 required fields" },
  { id: "unit-details", label: "Unit Details", helper: "Add units" },
  { id: "ship-to", label: "Ship To", helper: "Customer & consignee" },
  { id: "recipients", label: "Recipients", helper: "Optional emails" },
  { id: "signature", label: "Signature", helper: "Creator & files" }
];

const draftStorageKey = "local-request-draft";

type UnitRow = {
  id: string;
  unit: string;
  serial: string;
  quantity: number;
  description: string;
  classificationCode: string;
  eccn: string;
  license: string;
  countryOfOrigin: string;
  unitPrice: string;
  dimensionUnit: "cm" | "in";
  length: string;
  width: string;
  height: string;
  weightUnit: "kg" | "lbs";
  unitWeight: string;
};

type RequestFields = {
  shipFrom: string;
  requestNumber: string;
  requestType: string;
  serviceLevel: string;
  requestDate: string;
  shipDate: string;
  modeTransport: string;
  freightForwarder: string;
  awb: string;
  license: string;
  note: string;
};

const unitOptions = ["RFID Reader", "RFID Tag", "Handheld Scanner", "Dock Door Portal"];
const customerOptions = ["PT Kirana Retail", "Sinar Abadi Group", "Atlas Fashion"];
const consigneeOptions = ["Warehouse Alpha", "Distribution Beta", "Storefront Gamma"];
const storedRecipientEmails = ["ops@kirana.co.id", "warehouse@atlasfshn.com", "logistics@sinarabadi.id"];
const deliveryCreators = [
  { id: "dc-1", name: "Michella", phone: "+62 812 1111 2222", email: "michella@rfid.co.id" },
  { id: "dc-2", name: "Aditya", phone: "+62 812 3333 4444", email: "aditya@rfid.co.id" },
  { id: "dc-3", name: "Rani", phone: "+62 812 5555 6666", email: "rani@rfid.co.id" }
];

export default function NewLocalRequestPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [showErrors, setShowErrors] = React.useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);
  const [requestFields, setRequestFields] = React.useState<RequestFields>({
    shipFrom: "",
    requestNumber: "REQ-2026-028",
    requestType: "",
    serviceLevel: "",
    requestDate: "",
    shipDate: "",
    modeTransport: "",
    freightForwarder: "",
    awb: "",
    license: "",
    note: ""
  });
  const [unitRows, setUnitRows] = React.useState<UnitRow[]>([
    {
      id: "unit-1",
      unit: "",
      serial: "",
      quantity: 1,
      description: "",
      classificationCode: "",
      eccn: "",
      license: "enc",
      countryOfOrigin: "",
      unitPrice: "",
      dimensionUnit: "cm",
      length: "",
      width: "",
      height: "",
      weightUnit: "kg",
      unitWeight: ""
    }
  ]);

  const handleAddUnit = () => {
    setUnitRows((prev) => [
      ...prev,
      {
        id: `unit-${prev.length + 1}`,
        unit: "",
        serial: "",
        quantity: 1,
        description: "",
        classificationCode: "",
        eccn: "",
        license: "enc",
        countryOfOrigin: "",
        unitPrice: "",
        dimensionUnit: "cm",
        length: "",
        width: "",
        height: "",
        weightUnit: "kg",
        unitWeight: ""
      }
    ]);
  };

  const handleRemoveUnit = (id: string) => {
    setUnitRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateUnitRow = <K extends keyof UnitRow>(id: string, key: K, value: UnitRow[K]) => {
    setUnitRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const getExtendedPrice = (row: UnitRow) => {
    const price = Number(row.unitPrice || 0);
    return (price * row.quantity).toFixed(2);
  };

  const [copyConsignee, setCopyConsignee] = React.useState(true);
  const [customer, setCustomer] = React.useState({
    shipTo: "",
    zipCode: "",
    country: "",
    city: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [consignee, setConsignee] = React.useState({
    shipTo: "",
    zipCode: "",
    country: "",
    city: "",
    address: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  });

  const effectiveConsignee = copyConsignee ? customer : consignee;
  const [recipientEmailInput, setRecipientEmailInput] = React.useState("");
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [customerPickup, setCustomerPickup] = React.useState(false);
  const [selectedCreator, setSelectedCreator] = React.useState(deliveryCreators[0]);
  const [timestamp, setTimestamp] = React.useState("");
  const [invoiceRequired, setInvoiceRequired] = React.useState(false);
  const [packingListRequired, setPackingListRequired] = React.useState(false);
  const [defaultWeightUnit, setDefaultWeightUnit] = React.useState("kg");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);

  const handleAddRecipient = () => {
    const trimmed = recipientEmailInput.trim();
    if (!trimmed || recipients.includes(trimmed)) {
      return;
    }
    setRecipients((prev) => [...prev, trimmed]);
    setRecipientEmailInput("");
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((item) => item !== email));
  };

  const handleCreatorChange = (creatorId: string) => {
    const found = deliveryCreators.find((creator) => creator.id === creatorId);
    if (found) {
      setSelectedCreator(found);
    }
  };

  const isStep1Valid = React.useMemo(() => {
    const required = [
      requestFields.shipFrom,
      requestFields.requestType,
      requestFields.serviceLevel,
      requestFields.requestDate,
      requestFields.shipDate,
      requestFields.modeTransport,
      requestFields.freightForwarder
    ];
    return required.every((value) => value);
  }, [requestFields]);

  const isStep2Valid = React.useMemo(() => {
    return unitRows.every((row) => row.unit && row.serial && row.quantity > 0);
  }, [unitRows]);

  const isStep3Valid = React.useMemo(() => {
    const customerValid = Object.values(customer).every((value) => value);
    if (copyConsignee) {
      return customerValid;
    }
    return customerValid && Object.values(consignee).every((value) => value);
  }, [consignee, copyConsignee, customer]);

  const isStepValid = React.useMemo(() => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2) return isStep2Valid;
    if (currentStep === 3) return isStep3Valid;
    return true;
  }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid]);

  const handleNext = () => {
    if (!isStepValid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const handleBack = () => {
    setShowErrors(false);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSaveDraft = () => {
    const payload = {
      currentStep,
      requestFields,
      unitRows,
      customer,
      consignee,
      copyConsignee,
      recipients
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
  };

  const handleDiscard = () => {
    localStorage.removeItem(draftStorageKey);
    setCurrentStep(1);
    setRequestFields({
      shipFrom: "",
      requestNumber: "REQ-2026-028",
      requestType: "",
      serviceLevel: "",
      requestDate: "",
      shipDate: "",
      modeTransport: "",
      freightForwarder: "",
      awb: "",
      license: "",
      note: ""
    });
    setUnitRows([
      {
        id: "unit-1",
        unit: "",
        serial: "",
        quantity: 1,
        description: "",
        classificationCode: "",
        eccn: "",
        license: "enc",
        countryOfOrigin: "",
        unitPrice: "",
        dimensionUnit: "cm",
        length: "",
        width: "",
        height: "",
        weightUnit: "kg",
        unitWeight: ""
      }
    ]);
    setCustomer({
      shipTo: "",
      zipCode: "",
      country: "",
      city: "",
      address: "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    });
    setConsignee({
      shipTo: "",
      zipCode: "",
      country: "",
      city: "",
      address: "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    });
    setCopyConsignee(true);
    setRecipients([]);
    setRecipientEmailInput("");
    setShowErrors(false);
  };

  const handleSubmit = () => {
    if (!isStepValid) {
      setShowErrors(true);
      return;
    }
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    localStorage.removeItem(draftStorageKey);
    setShowSubmitDialog(false);
    router.push("/requests/local");
  };

  const stepperItems = steps.map((step, index) => {
    const stepNumber = index + 1;
    if (stepNumber < currentStep) {
      return { ...step, status: "completed" as const };
    }
    if (stepNumber === currentStep) {
      if (showErrors && !isStepValid) {
        return { ...step, status: "error" as const };
      }
      return { ...step, status: "active" as const };
    }
    return { ...step, status: "upcoming" as const };
  });

  const progressValue = ((currentStep - 1) / (steps.length - 1)) * 100;

  React.useEffect(() => {
    const raw = localStorage.getItem(draftStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.requestFields) setRequestFields(parsed.requestFields);
      if (parsed.unitRows) setUnitRows(parsed.unitRows);
      if (parsed.customer) setCustomer(parsed.customer);
      if (parsed.consignee) setConsignee(parsed.consignee);
      if (typeof parsed.copyConsignee === "boolean") setCopyConsignee(parsed.copyConsignee);
      if (parsed.recipients) setRecipients(parsed.recipients);
      if (parsed.currentStep) setCurrentStep(parsed.currentStep);
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, []);

  return (
    <div className="relative flex flex-col gap-6 pb-24">
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Request?</DialogTitle>
            <DialogDescription>Confirm submission. This will return you to the request list.</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleConfirmSubmit}>
              Confirm Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PageHeader
        eyebrow="Requests"
        title="Create New Local Request"
        subtitle="Draft in progress - Local time reflects your current timezone"
        actions={<Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Draft</Badge>}
      />

      <Separator />

      <div className="flex flex-col gap-4">
        <FormStepper steps={stepperItems} progressValue={progressValue} />
        <p className="text-xs text-slate-400">Use the sections below to complete each step.</p>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={currentStep === steps.length}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {currentStep === 1 && (
          <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Ship From <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Select the originating warehouse or hub.</p>
                  <Select
                    value={requestFields.shipFrom}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, shipFrom: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select ship from" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="jakarta">Jakarta Hub</SelectItem>
                    <SelectItem value="bandung">Bandung DC</SelectItem>
                    <SelectItem value="surabaya">Surabaya Hub</SelectItem>
                  </SelectContent>
                </Select>
                  {showErrors && !requestFields.shipFrom && (
                    <p className="mt-1 text-xs text-rose-500">Ship From is required.</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Request Number <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Auto-generated when the request is saved.</p>
                  <Input className="mt-2" readOnly value={requestFields.requestNumber} />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Request Type <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Select the request category.</p>
                  <Select
                    value={requestFields.requestType}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, requestType: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Service Level <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Set the expected service priority.</p>
                  <Select
                    value={requestFields.serviceLevel}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, serviceLevel: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Request Date <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">When the request is created.</p>
                  <Input
                    className="mt-2"
                    type="datetime-local"
                    value={requestFields.requestDate}
                    onChange={(event) => setRequestFields((prev) => ({ ...prev, requestDate: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Ship Date <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Planned departure date.</p>
                  <Input
                    className="mt-2"
                    type="datetime-local"
                    value={requestFields.shipDate}
                    onChange={(event) => setRequestFields((prev) => ({ ...prev, shipDate: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Mode of Transport <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">How the shipment will be transported.</p>
                  <Select
                    value={requestFields.modeTransport}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, modeTransport: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="air">Air</SelectItem>
                      <SelectItem value="sea">Sea</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Freight Forwarder <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Logistics partner handling the shipment.</p>
                  <Select
                    value={requestFields.freightForwarder}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, freightForwarder: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select forwarder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dhl">DHL Supply Chain</SelectItem>
                      <SelectItem value="jnt">JNT Logistics</SelectItem>
                      <SelectItem value="fedex">FedEx Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">AWB</label>
                  <p className="text-xs text-slate-400">Airway bill number (optional).</p>
                  <Input
                    className="mt-2"
                    placeholder="Enter AWB number"
                    value={requestFields.awb}
                    onChange={(event) => setRequestFields((prev) => ({ ...prev, awb: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">License</label>
                  <p className="text-xs text-slate-400">Select the export license if applicable.</p>
                  <Select
                    value={requestFields.license}
                    onValueChange={(value) => setRequestFields((prev) => ({ ...prev, license: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enc">ENC</SelectItem>
                      <SelectItem value="n/a">N/A</SelectItem>
                      <SelectItem value="custom">Custom License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Note</label>
                  <p className="text-xs text-slate-400">Add internal remarks for the operations team.</p>
                  <Textarea
                    className="mt-2"
                    placeholder="Write a note..."
                    rows={6}
                    value={requestFields.note}
                    onChange={(event) => setRequestFields((prev) => ({ ...prev, note: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {currentStep === 2 && (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Unit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-600">Add units that will be included in this request.</p>
              </div>
              <Button variant="outline" onClick={handleAddUnit}>
                <Plus className="h-4 w-4" />
                Add Unit
              </Button>
            </div>

            <Accordion type="multiple" className="mt-4 rounded-lg border border-border/60 bg-white">
              {unitRows.map((row, index) => (
                <AccordionItem key={row.id} value={row.id} className="px-4">
                  <AccordionTrigger>
                    <div className="flex w-full flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-semibold text-slate-900">
                          {row.unit || `Unit ${index + 1}`}
                        </span>
                        <span className="text-xs text-slate-500">
                          Serial: {row.serial || "-"} - Qty: {row.quantity}
                        </span>
                      </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>Total: ${getExtendedPrice(row)}</span>
                          <div
                            role="button"
                            tabIndex={0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveUnit(row.id);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleRemoveUnit(row.id);
                              }
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </div>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Unit <span className="text-rose-500">*</span>
                          </label>
                  <Select value={row.unit} onValueChange={(value) => updateUnitRow(row.id, "unit", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                            <SelectContent>
                              {unitOptions.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Serial Number <span className="text-rose-500">*</span>
                          </label>
                          <Input
                            className="mt-2"
                            placeholder="Enter serial number"
                            value={row.serial}
                            onChange={(event) => updateUnitRow(row.id, "serial", event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Quantity</label>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateUnitRow(row.id, "quantity", Math.max(1, row.quantity - 1))
                              }
                            >
                              -
                            </Button>
                            <Input
                              className="w-16 text-center"
                              value={row.quantity}
                              onChange={(event) =>
                                updateUnitRow(row.id, "quantity", Number(event.target.value || 1))
                              }
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateUnitRow(row.id, "quantity", row.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Description</label>
                          <Textarea
                            className="mt-2"
                            rows={4}
                            placeholder="Add a unit description"
                            value={row.description}
                            onChange={(event) => updateUnitRow(row.id, "description", event.target.value)}
                          />
                        </div>
                      </div>

              <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Classification Code</label>
                            <Input
                              className="mt-2"
                              placeholder="e.g. 8471.30"
                              value={row.classificationCode}
                              onChange={(event) => updateUnitRow(row.id, "classificationCode", event.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">ECCN</label>
                            <Input
                              className="mt-2"
                              placeholder="e.g. 5A992"
                              value={row.eccn}
                              onChange={(event) => updateUnitRow(row.id, "eccn", event.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">License</label>
                            <Select value={row.license} onValueChange={(value) => updateUnitRow(row.id, "license", value)}>
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select license" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enc">ENC</SelectItem>
                                <SelectItem value="n/a">N/A</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Country of Origin</label>
                            <Input
                              className="mt-2"
                              placeholder="e.g. Indonesia"
                              value={row.countryOfOrigin}
                              onChange={(event) => updateUnitRow(row.id, "countryOfOrigin", event.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Unit Price</label>
                            <Input
                              className="mt-2"
                              placeholder="0.00"
                              value={row.unitPrice}
                              onChange={(event) => updateUnitRow(row.id, "unitPrice", event.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Extended Price</label>
                            <Input className="mt-2" readOnly value={getExtendedPrice(row)} />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Dimension</label>
                          <div className="mt-2 grid gap-2 sm:grid-cols-4">
                            <Input
                              placeholder="L"
                              value={row.length}
                              onChange={(event) => updateUnitRow(row.id, "length", event.target.value)}
                            />
                            <Input
                              placeholder="W"
                              value={row.width}
                              onChange={(event) => updateUnitRow(row.id, "width", event.target.value)}
                            />
                            <Input
                              placeholder="H"
                              value={row.height}
                              onChange={(event) => updateUnitRow(row.id, "height", event.target.value)}
                            />
                            <Select
                              value={row.dimensionUnit}
                              onValueChange={(value) => updateUnitRow(row.id, "dimensionUnit", value as UnitRow["dimensionUnit"])}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cm">cm</SelectItem>
                                <SelectItem value="in">in</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700">Unit Weight</label>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <Input
                              placeholder="Weight"
                              value={row.unitWeight}
                              onChange={(event) => updateUnitRow(row.id, "unitWeight", event.target.value)}
                            />
                            <Select
                              value={row.weightUnit}
                              onValueChange={(value) => updateUnitRow(row.id, "weightUnit", value as UnitRow["weightUnit"])}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lbs">lbs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => handleRemoveUnit(row.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        )}

        {currentStep === 3 && (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ship To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Select Stored Customer</p>
                <p className="text-xs text-slate-400">Pick an existing customer profile.</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>Customer editor will appear here.</DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select stored customer" />
              </SelectTrigger>
              <SelectContent>
                {customerOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or Create New Customer
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Ship To <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Customer name"
                  value={customer.shipTo}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, shipTo: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Zip Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Postal code"
                  value={customer.zipCode}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, zipCode: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Country <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={customer.country}
                  onValueChange={(value) => setCustomer((prev) => ({ ...prev, country: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indonesia">Indonesia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="City"
                  value={customer.city}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, city: event.target.value }))}
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Address <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  className="mt-2"
                  placeholder="Full street address"
                  value={customer.address}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, address: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Contact person"
                  value={customer.contactName}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, contactName: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="name@email.com"
                  value={customer.contactEmail}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, contactEmail: event.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="+62"
                  value={customer.contactPhone}
                  onChange={(event) => setCustomer((prev) => ({ ...prev, contactPhone: event.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Select Stored Consignee</p>
                <p className="text-xs text-slate-400">Optional destination contact.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Switch checked={copyConsignee} onCheckedChange={setCopyConsignee} />
                Copy consignee from customer
              </div>
            </div>
            <Select disabled={copyConsignee}>
              <SelectTrigger>
                <SelectValue placeholder="Select stored consignee" />
              </SelectTrigger>
              <SelectContent>
                {consigneeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Consignee Company <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Consignee name"
                  value={effectiveConsignee.shipTo}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, shipTo: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Zip Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Postal code"
                  value={effectiveConsignee.zipCode}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, zipCode: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Country <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={effectiveConsignee.country}
                  onValueChange={(value) => setConsignee((prev) => ({ ...prev, country: value }))}
                  disabled={copyConsignee}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indonesia">Indonesia</SelectItem>
                    <SelectItem value="singapore">Singapore</SelectItem>
                    <SelectItem value="malaysia">Malaysia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="City"
                  value={effectiveConsignee.city}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, city: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Address <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  className="mt-2"
                  placeholder="Full street address"
                  value={effectiveConsignee.address}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, address: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="Contact person"
                  value={effectiveConsignee.contactName}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, contactName: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="name@email.com"
                  value={effectiveConsignee.contactEmail}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, contactEmail: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <Input
                  className="mt-2"
                  placeholder="+62"
                  value={effectiveConsignee.contactPhone}
                  onChange={(event) => setConsignee((prev) => ({ ...prev, contactPhone: event.target.value }))}
                  disabled={copyConsignee}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {currentStep === 4 && (
        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Additional Recipients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className="text-sm font-medium text-slate-700">Recipient Email</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Input
                    placeholder="Add email address"
                    value={recipientEmailInput}
                    onChange={(event) => setRecipientEmailInput(event.target.value)}
                  />
                  <Button variant="outline" onClick={handleAddRecipient}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="min-w-[220px]">
                <label className="text-sm font-medium text-slate-700">Stored Emails</label>
                <Select onValueChange={(value) => setRecipientEmailInput(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select stored email" />
                  </SelectTrigger>
                  <SelectContent>
                    {storedRecipientEmails.map((email) => (
                      <SelectItem key={email} value={email}>
                        {email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {recipients.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
                No additional recipients added yet.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {recipients.map((email) => (
                  <Badge key={email} className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {email}
                    <button
                      type="button"
                      className="ml-2 text-slate-400 hover:text-slate-600"
                      onClick={() => handleRemoveRecipient(email)}
                    >
                      x
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {currentStep === 5 && (
          <>
          <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Signature & Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Select Delivery Creator</label>
                  <Select value={selectedCreator.id} onValueChange={handleCreatorChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select creator" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryCreators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Timestamp</label>
                  <Input
                    className="mt-2"
                    type="datetime-local"
                    value={timestamp}
                    onChange={(event) => setTimestamp(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">User</label>
                  <Input className="mt-2" value={selectedCreator.name} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input className="mt-2" value={selectedCreator.phone} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input className="mt-2" value={selectedCreator.email} readOnly />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Customer Pickup</p>
                <p className="text-xs text-slate-400">Enable if the customer will pick up the shipment.</p>
              </div>
              <Switch checked={customerPickup} onCheckedChange={setCustomerPickup} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Attach File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Invoice</p>
                    <p className="text-xs text-slate-400">Include invoice in the shipment.</p>
                  </div>
                  <Switch checked={invoiceRequired} onCheckedChange={setInvoiceRequired} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Packing List</p>
                    <p className="text-xs text-slate-400">Include packing list document.</p>
                  </div>
                  <Switch checked={packingListRequired} onCheckedChange={setPackingListRequired} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Default Weight Unit</p>
                  <RadioGroup
                    className="mt-2 flex flex-wrap items-center gap-4"
                    value={defaultWeightUnit}
                    onValueChange={setDefaultWeightUnit}
                  >
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <RadioGroupItem value="kg" />
                      kg
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <RadioGroupItem value="lbs" />
                      lbs
                    </label>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Upload File</p>
                  <p className="text-xs text-slate-400">Max file size 1MB - PDF only</p>
                  <Input
                    className="mt-2"
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setUploadedFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                {uploadedFile ? (
                  <div className="flex items-center justify-between rounded-lg border border-border/60 bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-600">{uploadedFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-sm text-slate-500">
                    No file uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <Button variant="ghost" onClick={() => router.push("/requests/local")}>
              Cancel
            </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleDiscard}>
              Discard
            </Button>
            <Button variant="secondary" onClick={handleSaveDraft}>
              Save
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}




