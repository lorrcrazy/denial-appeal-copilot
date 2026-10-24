import type { CaseDocs, ConditionCategory, InsuranceType } from '../lib/types'

export interface SampleCase {
  id: string
  title: string
  subtitle: string
  insuranceType: InsuranceType
  condition: ConditionCategory
  docs: CaseDocs
}

// All letters, people, plans, and IDs below are synthetic. No real PHI.
export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'biologic',
    title: 'Biologic drug denied',
    subtitle: 'Step therapy · Employer PPO',
    insuranceType: 'Employer PPO',
    condition: 'Autoimmune & GI',
    docs: {
      denial: `Peachtree Health Plan
Utilization Management Department
P.O. Box 4410, Atlanta, GA 30302

October 6, 2026

Jordan Rivera
1842 Magnolia Ave NE
Atlanta, GA 30307

RE: Notice of Adverse Benefit Determination
Member Name: Jordan Rivera
Member ID: PHP-883-20417
Date of Birth: 03/14/1998
Plan: Peachtree Choice PPO (Employer Group GA-55120)
Claim Number: CLM-2026-0918-4471
Requesting Provider: Dr. Priya Natarajan, Midtown Gastroenterology
Service Requested: Humira (adalimumab) 40 mg every 2 weeks
Date of Request: September 18, 2026

Dear Jordan Rivera,

We reviewed the request for Humira (adalimumab) and have denied coverage. Reason for denial: The request does not meet our Step Therapy Policy RX-114 because the records provided do not show a trial and failure of a conventional immunomodulator for at least 12 weeks. This medication is therefore not considered medically necessary at this time.

This decision was made by a clinical pharmacist reviewer, Dr. Alan Whitfield, PharmD, using Peachtree Clinical Policy RX-114 (Biologic Agents for Inflammatory Bowel Disease).

Your right to appeal: You or your provider may request an internal appeal within 180 days of the date of this letter. Urgent appeals are decided within 72 hours. If we uphold our decision, you may request an external review by an Independent Review Organization within 4 months of our final decision.

To appeal, write to Peachtree Health Plan Appeals, P.O. Box 4415, Atlanta, GA 30302, or call 1-800-555-0142.`,
      records: `Midtown Gastroenterology - Clinical Summary
Patient: Jordan Rivera    DOB: 03/14/1998    MRN: 00482913
Provider: Dr. Priya Natarajan, MD

Diagnosis: Crohn's disease of the ileum (K50.00), moderate to severe, diagnosed 2023.

Treatment history:
- Mesalamine 4.8 g/day from March 2024 to August 2024 with no clinical response.
- Prednisone taper, two courses in 2024, with relapse within 3 weeks of each taper.
- Azathioprine 2.5 mg/kg/day was started on January 6, 2025 and continued for 16 weeks.
- Azathioprine was discontinued on May 1, 2025 due to persistent symptoms and elevated liver enzymes (ALT 142 U/L).

Current status (September 2, 2026): 6 to 8 loose stools per day, 11 lb weight loss over 3 months, CRP 38 mg/L, and colonoscopy showing deep ileal ulcerations.

Assessment: Patient has failed conventional therapy, including a 16-week trial of azathioprine that was stopped for inadequate response and hepatotoxicity. Biologic therapy with adalimumab is medically necessary to induce remission and avoid steroid dependence and surgery.`,
      policy: `Peachtree Clinical Policy RX-114: Biologic Agents for Inflammatory Bowel Disease
Effective January 1, 2026

Section 3.1 Coverage criteria. Adalimumab is considered medically necessary for adults with moderately to severely active Crohn's disease when the criteria in Section 3.2 are met.

Section 3.2 Step therapy. The member must have tried and failed, or have a contraindication or intolerance to, at least one conventional therapy (corticosteroids, azathioprine, 6-mercaptopurine, or methotrexate) for a minimum of 12 weeks, unless the therapy was stopped earlier because of intolerance.

Section 3.4 Documentation. Failure may be documented by chart notes describing inadequate response, intolerance, or adverse effects such as hepatotoxicity.

Section 5.1 Step therapy exceptions. An exception must be granted when the required drug has been tried and discontinued due to lack of efficacy or an adverse event.`,
    },
  },
  {
    id: 'er',
    title: 'ER visit billed out-of-network',
    subtitle: 'Out-of-network · ACA Marketplace',
    insuranceType: 'ACA Marketplace',
    condition: 'Emergency care',
    docs: {
      denial: `Summit BlueCare
Claims Review Unit
P.O. Box 7720, Charlotte, NC 28241

August 14, 2026

Maya Chen
77 Larkspur Lane
Decatur, GA 30030

RE: Explanation of Denial
Member Name: Maya Chen
Member ID: SBC-4410-77821
Date of Birth: 11/02/2001
Plan: Summit Silver HMO (Marketplace)
Claim Number: SB-26-55017-ER
Facility: Riverbend Medical Center Emergency Department
Date of Service: July 3, 2026

Dear Maya Chen,

Your claim for emergency department services at Riverbend Medical Center has been denied. Reason for denial: Riverbend Medical Center is an out-of-network facility and no referral or prior authorization was on file for this visit. You may be responsible for the full billed amount of $6,840.

Your right to appeal: You may file an internal appeal within 180 days of receiving this notice. You also have the right to request an external review after our final internal decision.

Questions? Call Member Services at 1-800-555-0199.`,
      records: `Riverbend Medical Center - Emergency Department Record
Patient: Maya Chen    DOB: 11/02/2001
Attending: Dr. Samuel Okafor, MD
Arrival: July 3, 2026, 11:42 PM by private vehicle

Chief complaint: Sudden crushing chest pain radiating to the left arm with shortness of breath for 40 minutes.

History: Patient stated she drove to the nearest emergency department because she believed she was having a heart attack.

Workup: ECG showed sinus tachycardia at 128 bpm. Troponin was negative times two. CT angiogram was negative for pulmonary embolism.

Diagnosis: Acute chest pain, ruled out acute coronary syndrome; probable pericarditis.

Disposition: Observed for 9 hours and discharged in stable condition with follow-up in 1 week.`,
      policy: `Summit BlueCare 2026 Evidence of Coverage - Silver HMO

Section 7.1 Emergency services. Emergency services are covered without prior authorization, whether the provider is in-network or out-of-network.

Section 7.2 Definition of emergency medical condition. An emergency medical condition is one with acute symptoms of sufficient severity, including severe pain, that a prudent layperson with an average knowledge of health and medicine could reasonably expect the absence of immediate medical attention to result in serious jeopardy to their health.

Section 7.3 Cost sharing. Emergency services from out-of-network providers are subject to in-network cost-sharing, and the member may not be balance billed as required by the federal No Surprises Act.

Section 7.4 Determination. Coverage of emergency services is based on the presenting symptoms, not the final diagnosis.`,
    },
  },
  {
    id: 'mri',
    title: 'MRI denied: no prior auth',
    subtitle: 'Prior authorization · Medicaid',
    insuranceType: 'Medicaid',
    condition: 'Bones, joints & pain',
    docs: {
      denial: `Keystone Care Medicaid
Medical Management
P.O. Box 3100, Savannah, GA 31402

September 29, 2026

Marcus Bell
905 Oglethorpe Rd
Savannah, GA 31401

RE: Notice of Action - Service Denied
Member Name: Marcus Bell
Member ID: KCM-551902-4
Date of Birth: 07/21/1987
Plan: Keystone Care Medicaid Managed Care
Reference Number: KC-PA-2026-88310
Ordering Provider: Dr. Elena Vasquez, Coastal Spine & Ortho
Service Requested: MRI lumbar spine without contrast

Dear Marcus Bell,

We have denied the request for an MRI of the lumbar spine. Reason for denial: Prior authorization criteria were not met because the request did not document at least 6 weeks of conservative therapy before advanced imaging.

Your right to appeal: You may ask for a plan appeal within 60 days of the date of this notice. If you need a fast decision because waiting could seriously harm your health, ask for an expedited appeal and we will decide within 72 hours. After the plan appeal, you may ask for a State Fair Hearing within 120 days.

Call 1-855-555-0123 for help.`,
      records: `Coastal Spine & Ortho - Progress Note
Patient: Marcus Bell    DOB: 07/21/1987
Provider: Dr. Elena Vasquez, DO
Visit date: September 22, 2026

Subjective: Low back pain radiating down the right leg for 10 weeks after lifting injury at work. Completed 8 weeks of physical therapy (16 sessions) and daily naproxen without improvement.

Objective: New right foot drop with weakness of ankle dorsiflexion graded 3 out of 5. Decreased sensation over the right L5 dermatome. Positive straight leg raise at 30 degrees.

Assessment: Lumbar radiculopathy with progressive neurological deficit, suspected L4-L5 disc herniation.

Plan: Urgent MRI lumbar spine without contrast to evaluate for nerve root compression and surgical candidacy.`,
      policy: `Keystone Care Medicaid Clinical Guideline IMG-07: Advanced Imaging of the Lumbar Spine

Section 2.1 General criteria. MRI of the lumbar spine is approved for low back pain after at least 6 weeks of documented conservative therapy, such as physical therapy or anti-inflammatory medication.

Section 2.3 Red flag exception. The conservative therapy requirement does not apply when there are red flag findings, including progressive neurological deficit, foot drop, cauda equina symptoms, suspected infection, or suspected malignancy.

Section 4.2 Expedited review. Requests documenting progressive neurological deficit qualify for expedited review.`,
    },
  },
]
