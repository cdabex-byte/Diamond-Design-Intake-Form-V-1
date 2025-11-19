import React, { useState, FormEvent } from 'react';
import { 
  Save, Send, Server, Users, BarChart3, Lightbulb, Target, FileCheck 
} from 'lucide-react';
import { 
  Input, TextArea, Select, CheckboxGroup, Slider, Checkbox 
} from './components/ui';
import {
  SYSTEMS_LIST, EMPLOYEE_RANGES, PAIN_POINTS_OPTIONS,
  SCHEDULING_OPTIONS, AI_PLATFORMS_OPTIONS, COMM_METHODS_OPTIONS,
  DATA_GATHERING_OPTIONS, DATA_USAGE_OPTIONS, OUTCOMES_OPTIONS,
  GOOGLE_SCRIPT_URL
} from './constants';
import { FormData, TechSystemData, ScoringResult } from './types';

const INITIAL_TECH_SYSTEM: TechSystemData = {
  usage: 0,
  fees: '',
  dataGathering: '',
  dataUsage: '',
  effective: '',
  effectiveDetails: ''
};

const INITIAL_DATA: FormData = {
  name: '',
  email: '',
  sendEmailCopy: true,
  employeeCount: '',
  roles: '',
  painPoints: [],
  painPointsDetails: '',
  dayInLife: '',
  tasksToReduce: '',
  revenueStreams: '',
  techStack: SYSTEMS_LIST.reduce((acc, sys) => ({ ...acc, [sys]: { ...INITIAL_TECH_SYSTEM } }), {}),
  schedulingMethod: [],
  schedulingDetails: '',
  staffUsingAI: 0,
  aiPlatforms: [],
  aiDetails: '',
  vendorCommMethods: [],
  vendorCommDetails: '',
  clientCommMethods: [],
  clientCommDetails: '',
  vendorProcess: '',
  clientProcess: '',
  dataGatheringMethod: [],
  dataGatheringDetails: '',
  dataUsageMethod: [],
  dataUsageDetails: '',
  dailyInsights: '',
  weeklyInsights: '',
  desiredOutcomes: [],
  desiredOutcomesDetails: '',
  confidenceFactor: '',
  additionalComments: ''
};

function calculateScore(data: FormData): ScoringResult {
  let painPointScore = data.painPoints.length * 10;
  
  let underusedSystemsCount = 0;
  Object.values(data.techStack).forEach(sys => {
    if (sys.usage > 0 && sys.usage < 5) underusedSystemsCount++;
  });

  let manualProcessScore = 0;
  if (data.schedulingMethod.includes("Manual (Spreadsheet/Paper)")) manualProcessScore += 20;
  if (data.dataGatheringMethod.includes("Manual Entry")) manualProcessScore += 20;

  let outcomeWeight = data.desiredOutcomes.length * 15;

  const totalPriorityScore = painPointScore + (underusedSystemsCount * 5) + manualProcessScore + outcomeWeight;

  return {
    painPointScore,
    underusedSystemsCount,
    manualProcessScore,
    outcomeWeight,
    totalPriorityScore
  };
}

export default function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTechStackChange = (system: string, field: keyof TechSystemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      techStack: {
        ...prev.techStack,
        [system]: {
          ...prev.techStack[system],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const scores = calculateScore(formData);
    
    // Prepare payload for Google Sheets
    // We flatten nested objects for easier spreadsheet parsing
    const flatPayload: Record<string, string | number | boolean> = {
      timestamp: new Date().toISOString(),
      name: formData.name,
      email: formData.email,
      sendEmailCopy: formData.sendEmailCopy,
      employeeCount: formData.employeeCount,
      roles: formData.roles,
      painPoints: formData.painPoints.join(', '),
      painPointsDetails: formData.painPointsDetails,
      dayInLife: formData.dayInLife,
      tasksToReduce: formData.tasksToReduce,
      revenueStreams: formData.revenueStreams,
      
      // Scoring
      score_Total: scores.totalPriorityScore,
      score_PainPoints: scores.painPointScore,
      score_UnderusedSystems: scores.underusedSystemsCount,
      score_ManualProcs: scores.manualProcessScore,
      
      // Tech Stack Summary (JSON stringified to fit in one cell if needed, or just summary)
      techStackJSON: JSON.stringify(formData.techStack),
      
      // Staff
      schedulingMethod: formData.schedulingMethod.join(', '),
      schedulingDetails: formData.schedulingDetails,
      staffUsingAI: formData.staffUsingAI,
      aiPlatforms: formData.aiPlatforms.join(', '),
      vendorCommMethods: formData.vendorCommMethods.join(', '),
      clientCommMethods: formData.clientCommMethods.join(', '),
      vendorProcess: formData.vendorProcess,
      clientProcess: formData.clientProcess,
      
      // Data
      dataGatheringMethod: formData.dataGatheringMethod.join(', '),
      dataUsageMethod: formData.dataUsageMethod.join(', '),
      dailyInsights: formData.dailyInsights,
      weeklyInsights: formData.weeklyInsights,
      
      // Outcomes
      desiredOutcomes: formData.desiredOutcomes.join(', '),
      desiredOutcomesDetails: formData.desiredOutcomesDetails,
      confidenceFactor: formData.confidenceFactor,
      additionalComments: formData.additionalComments
    };

    try {
      // Using fetch with no-cors for Google Apps Script
      // We use URLSearchParams to send as x-www-form-urlencoded
      const params = new URLSearchParams();
      Object.entries(flatPayload).forEach(([key, value]) => {
        params.append(key, String(value));
      });

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      // Since we can't read response in no-cors, we assume success if no network error
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setErrorMsg("Failed to submit form. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-diamond-500 rounded-xl p-8 text-center shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)]">
          <div className="w-16 h-16 bg-diamond-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Save className="w-8 h-8 text-diamond-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Submission Received</h2>
          <p className="text-slate-400 mb-6">
            Thank you for completing the Diamond Design Intake. Our team has received your business profile{formData.sendEmailCopy ? ` and a copy of your results has been sent to ${formData.email}` : ''}.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-diamond-600 hover:bg-diamond-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Hero Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-center md:justify-start mb-6">
            <img 
              src="./logo.png" 
              alt="Automyz Business Solutions" 
              className="h-24 w-auto object-contain rounded-lg"
            />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-diamond-500 rounded-lg rotate-3">
              <FileCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              The Diamond Design <span className="text-diamond-400">Intake Form</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            Complete this discovery document to help us map your automation strategy. 
            Our system will automatically score your needs based on pain points and system usage.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Contact Info */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-diamond-500" /> Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                placeholder="Jane Doe" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <Input 
                label="Email Address" 
                type="email" 
                required 
                placeholder="jane@company.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <div className="md:col-span-2 -mt-2">
                <Checkbox 
                  label="Send me a copy of my responses"
                  checked={formData.sendEmailCopy}
                  onChange={(c) => setFormData({...formData, sendEmailCopy: c})}
                />
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">01</span>
              <h3 className="text-xl font-semibold text-white">Business Overview</h3>
            </div>

            <Select 
              label="Number of Employees"
              options={EMPLOYEE_RANGES}
              value={formData.employeeCount}
              onChange={e => setFormData({...formData, employeeCount: e.target.value})}
            />

            <Input 
              label="Main Job Titles / Roles"
              placeholder="e.g., CEO, Operations Manager, 3 Sales Reps..."
              value={formData.roles}
              onChange={e => setFormData({...formData, roles: e.target.value})}
            />

            <CheckboxGroup 
              label="Top 5 Pain Points"
              options={PAIN_POINTS_OPTIONS}
              selected={formData.painPoints}
              onChange={vals => setFormData({...formData, painPoints: vals})}
              withDetails
              detailsPlaceholder="Describe specific bottlenecks..."
              detailsValue={formData.painPointsDetails}
              onDetailsChange={v => setFormData({...formData, painPointsDetails: v})}
            />

            <TextArea 
              label="A Day in the Life"
              sublabel="Briefly describe your typical daily workflow."
              placeholder="I start by checking emails, then manually export orders from Shopify to putting them into Sage..."
              value={formData.dayInLife}
              onChange={e => setFormData({...formData, dayInLife: e.target.value})}
            />

            <Input 
              label="Tasks You Want to Do Less Of"
              placeholder="e.g., Data entry, chasing invoices, scheduling staff"
              value={formData.tasksToReduce}
              onChange={e => setFormData({...formData, tasksToReduce: e.target.value})}
            />

            <TextArea 
              label="Revenue Streams & Approx Annual Revenue"
              placeholder="e.g., Online Sales ($500k), Wholesale ($200k). We rely heavily on Q4."
              value={formData.revenueStreams}
              onChange={e => setFormData({...formData, revenueStreams: e.target.value})}
            />
          </section>

          {/* Section 2: Tech Stack */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">02</span>
              <h3 className="text-xl font-semibold text-white">Tech Stack Usage</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">Rate your usage efficiency (0-10) for each system.</p>

            <div className="space-y-8">
              {SYSTEMS_LIST.map((system) => (
                <div key={system} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="text-lg font-medium text-diamond-100 mb-4 border-l-2 border-diamond-500 pl-3">{system}</h4>
                  
                  <Slider 
                    label="System Usage Efficiency"
                    value={formData.techStack[system].usage}
                    onChange={(val) => handleTechStackChange(system, 'usage', val)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Input 
                      label="Monthly/Yearly Fees"
                      placeholder="e.g. $29/mo"
                      value={formData.techStack[system].fees}
                      onChange={(e) => handleTechStackChange(system, 'fees', e.target.value)}
                    />
                    <Select 
                      label="Used Effectively?"
                      options={["Yes", "No", "Partially"]}
                      value={formData.techStack[system].effective}
                      onChange={(e) => handleTechStackChange(system, 'effective', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="How is data gathered?"
                      placeholder="e.g. Customer input at checkout"
                      value={formData.techStack[system].dataGathering}
                      onChange={(e) => handleTechStackChange(system, 'dataGathering', e.target.value)}
                    />
                    <Input 
                      label="What is done with data?"
                      placeholder="e.g. Synced to mailing list"
                      value={formData.techStack[system].dataUsage}
                      onChange={(e) => handleTechStackChange(system, 'dataUsage', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Staff & Scheduling */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">03</span>
              <h3 className="text-xl font-semibold text-white">Staff & Scheduling</h3>
            </div>

            <CheckboxGroup 
              label="How are staff scheduled?"
              options={SCHEDULING_OPTIONS}
              selected={formData.schedulingMethod}
              onChange={vals => setFormData({...formData, schedulingMethod: vals})}
              withDetails
              detailsValue={formData.schedulingDetails}
              onDetailsChange={v => setFormData({...formData, schedulingDetails: v})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input 
                label="Approx. Staff using AI Tools"
                type="number"
                placeholder="0"
                value={formData.staffUsingAI}
                onChange={e => setFormData({...formData, staffUsingAI: Number(e.target.value)})}
              />
            </div>

            <CheckboxGroup 
              label="AI Platforms Used"
              options={AI_PLATFORMS_OPTIONS}
              selected={formData.aiPlatforms}
              onChange={vals => setFormData({...formData, aiPlatforms: vals})}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               <div>
                 <CheckboxGroup 
                  label="Vendor Comm Methods"
                  options={COMM_METHODS_OPTIONS}
                  selected={formData.vendorCommMethods}
                  onChange={vals => setFormData({...formData, vendorCommMethods: vals})}
                />
               </div>
               <div>
                <CheckboxGroup 
                  label="Client Comm Methods"
                  options={COMM_METHODS_OPTIONS}
                  selected={formData.clientCommMethods}
                  onChange={vals => setFormData({...formData, clientCommMethods: vals})}
                />
               </div>
            </div>

            <TextArea 
              label="Vendor Communication Process"
              placeholder="e.g. We email POs on Mondays, then call if no confirmation by Wednesday."
              value={formData.vendorProcess}
              onChange={e => setFormData({...formData, vendorProcess: e.target.value})}
            />
             <TextArea 
              label="Client Communication Process"
              placeholder="e.g. Auto-confirmation email, then manual follow-up 2 weeks later."
              value={formData.clientProcess}
              onChange={e => setFormData({...formData, clientProcess: e.target.value})}
            />
          </section>

          {/* Section 4: Data */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">04</span>
              <h3 className="text-xl font-semibold text-white">Data & Insights</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <CheckboxGroup 
                  label="How is business data gathered?"
                  options={DATA_GATHERING_OPTIONS}
                  selected={formData.dataGatheringMethod}
                  onChange={vals => setFormData({...formData, dataGatheringMethod: vals})}
                  withDetails
                  detailsValue={formData.dataGatheringDetails}
                  onDetailsChange={v => setFormData({...formData, dataGatheringDetails: v})}
                />
                <CheckboxGroup 
                  label="How is data used?"
                  options={DATA_USAGE_OPTIONS}
                  selected={formData.dataUsageMethod}
                  onChange={vals => setFormData({...formData, dataUsageMethod: vals})}
                  withDetails
                  detailsValue={formData.dataUsageDetails}
                  onDetailsChange={v => setFormData({...formData, dataUsageDetails: v})}
                />
            </div>

            <Input 
              label="Insights Desired Daily"
              placeholder="e.g. Total sales vs targets, low stock alerts"
              value={formData.dailyInsights}
              onChange={e => setFormData({...formData, dailyInsights: e.target.value})}
            />
            <Input 
              label="Insights Desired Weekly/Monthly"
              placeholder="e.g. Profit margins per product line, staff efficiency"
              value={formData.weeklyInsights}
              onChange={e => setFormData({...formData, weeklyInsights: e.target.value})}
            />
          </section>

          {/* Section 5: Outcomes */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">05</span>
              <h3 className="text-xl font-semibold text-white">Desired Outcomes</h3>
            </div>
            
             <CheckboxGroup 
                label="Top 3 Desired Outcomes"
                options={OUTCOMES_OPTIONS}
                selected={formData.desiredOutcomes}
                onChange={vals => setFormData({...formData, desiredOutcomes: vals})}
                withDetails
                detailsPlaceholder="Specific metrics?"
                detailsValue={formData.desiredOutcomesDetails}
                onDetailsChange={v => setFormData({...formData, desiredOutcomesDetails: v})}
              />

              <TextArea 
                label="What would make you confident investing in automation?"
                placeholder="e.g. Seeing a clear ROI calculation or a proof-of-concept for the inventory sync."
                value={formData.confidenceFactor}
                onChange={e => setFormData({...formData, confidenceFactor: e.target.value})}
              />
          </section>

          {/* Section 6: Wrap Up */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
              <span className="bg-diamond-900 text-diamond-300 text-xs font-bold px-2 py-1 rounded">06</span>
              <h3 className="text-xl font-semibold text-white">Wrap-Up</h3>
            </div>
            <TextArea 
              label="Additional Comments"
              placeholder="Any other requirements, strict deadlines, or questions?"
              value={formData.additionalComments}
              onChange={e => setFormData({...formData, additionalComments: e.target.value})}
            />
          </section>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit Area */}
          <div className="sticky bottom-4 p-4 bg-slate-900/90 backdrop-blur border border-diamond-500/50 rounded-xl flex justify-between items-center shadow-2xl z-20">
            <div className="text-sm text-slate-400 hidden sm:block">
              Your data is secure & automatically scored.
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-diamond-600 to-diamond-500 hover:from-diamond-500 hover:to-diamond-400 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Submit Discovery <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </main>
      
      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-slate-500 text-xs">
        <p>The Diamond Design Intake Form &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 opacity-50">v1.0.4</p>
      </footer>
    </div>
  );
}
