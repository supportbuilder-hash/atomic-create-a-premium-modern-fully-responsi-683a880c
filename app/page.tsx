"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Download, Code2 as Github, Briefcase as Linkedin, Mail, ArrowRight, ChevronRight, Check, Clock, Activity, AlertTriangle, Terminal, FileCode, GitBranch, FileText, Settings, Circle } from 'lucide-react';
import {
  APP_NAME,
  TAGLINE,
  EMAIL,
  LINKEDIN_URL,
  GITHUB_URL,
  RESUME_URL,
} from "@/lib/data";
import { fadeInUp, fadeIn, staggerContainer, scaleIn } from "@/lib/motion";
import { Reveal } from "@/components/Reveal";

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CUBE_LAYERS = [
  { id: "unit", label: "Unit" },
  { id: "integration", label: "Integration" },
  { id: "e2e", label: "End-to-End" },
  { id: "performance", label: "Performance" },
];

interface Discipline {
  id: string;
  title: string;
  summary: string;
  approach: string;
}

const EXPERTISE: Discipline[] = [
  {
    id: "functional",
    title: "Functional Testing",
    summary: "Verifying every feature behaves exactly as specified.",
    approach:
      "I map each requirement to a testable condition before writing a single case, then trace UI flows down through the backend so a pass actually means the feature works end to end, not just that a button is clickable.",
  },
  {
    id: "regression",
    title: "Regression Testing",
    summary: "Layered suites that re-check prior behavior before every release.",
    approach:
      "I keep regression suites tiered: a fast smoke pass for every commit, a fuller functional pass before merges, and a deep pass before release, so coverage grows without turning every build into an hour-long wait.",
  },
  {
    id: "api",
    title: "API Testing",
    summary: "Contract and integration validation beyond the UI.",
    approach:
      "I validate status codes, schema shape, and edge-case payloads directly against the contract in Postman and automated scripts, so backend regressions get caught before they ever reach a screen.",
  },
  {
    id: "automation",
    title: "Automation Engineering",
    summary: "Playwright-driven suites wired into the delivery pipeline.",
    approach:
      "I build automation around a page-object structure with clear separation between scenario, script, and assertion, so suites stay readable and a failing test tells you exactly what broke.",
  },
  {
    id: "performance",
    title: "Performance Testing",
    summary: "JMeter load and stress scenarios to catch bottlenecks early.",
    approach:
      "I design load profiles that mirror realistic usage patterns rather than arbitrary spikes, then watch response time and error-rate trends across the run instead of chasing a single pass or fail number.",
  },
  {
    id: "exploratory",
    title: "Exploratory Testing",
    summary: "Structured, charter-based sessions hunting for edge cases.",
    approach:
      "I run time-boxed charters with a clear mission, like 'break the checkout flow with invalid states', and log findings as I go, so exploration stays focused instead of becoming random clicking.",
  },
  {
    id: "cross-browser",
    title: "Cross-Browser & Device Testing",
    summary: "Consistent behavior across a real browser and device matrix.",
    approach:
      "I prioritize the matrix by actual usage data rather than testing everything equally, then automate the high-traffic combinations and manually spot-check the rest.",
  },
  {
    id: "accessibility",
    title: "Accessibility Testing",
    summary: "Keyboard navigation, screen reader flow, and WCAG checks.",
    approach:
      "I test with a keyboard only before I ever touch a mouse, then verify landmark structure and labeling with a screen reader, catching the gaps that automated scanners alone tend to miss.",
  },
  {
    id: "test-data",
    title: "Test Data Management",
    summary: "Reusable, isolated datasets that keep suites deterministic.",
    approach:
      "I keep fixtures small and composable rather than one giant shared database, so tests stay deterministic and a failure in one suite never cascades into unrelated ones.",
  },
  {
    id: "defect-reporting",
    title: "Defect Reporting & Verification",
    summary: "Reports developers can act on without back-and-forth.",
    approach:
      "Every report I write includes reproducible steps, environment, expected versus actual behavior, and evidence, then I verify the fix myself against the original repro before closing it out.",
  },
];

interface WorkflowStep {
  id: string;
  label: string;
  icon: typeof FileText;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "requirement", label: "Requirement", icon: FileText },
  { id: "scenario", label: "Test Scenario", icon: GitBranch },
  { id: "script", label: "Playwright Script", icon: FileCode },
  { id: "execution", label: "Browser Execution", icon: Terminal },
  { id: "assertion", label: "Assertion", icon: Check },
  { id: "report", label: "Report", icon: Activity },
  { id: "regression", label: "Regression Coverage", icon: Settings },
];

const PLAYWRIGHT_SAMPLE = `import { test, expect } from '@playwright/test';

test('user can complete checkout with saved card', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByLabel('Card number').fill('4242 4242 4242 4242');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByText('Order confirmed')).toBeVisible();
  await expect(page).toHaveURL(/\\/orders\\/\\d+/);
});`;

interface LabCard {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
}

const LAB_CARDS: LabCard[] = [
  {
    id: "playwright",
    title: "Playwright Automation",
    description:
      "Browser suites structured around page objects, with scenario and assertion kept separate so failures are easy to diagnose.",
    icon: Terminal,
  },
  {
    id: "postman",
    title: "API Validation with Postman",
    description:
      "Collections that check status codes, schema shape, and negative cases, wired into pre-release checks before UI testing starts.",
    icon: FileCode,
  },
  {
    id: "jmeter",
    title: "JMeter Performance Testing",
    description:
      "Load profiles built from realistic usage patterns, run in approved QA environments to surface bottlenecks early.",
    icon: Activity,
  },
  {
    id: "regression-design",
    title: "Regression Suite Design",
    description:
      "Tiered suites from smoke to full regression, so coverage grows with the product instead of slowing every commit down.",
    icon: GitBranch,
  },
  {
    id: "test-data-structure",
    title: "Reusable Test Data & Structure",
    description:
      "Small, composable fixtures and a consistent folder structure that keep suites deterministic and easy to extend.",
    icon: Settings,
  },
  {
    id: "failure-evidence",
    title: "Failure Evidence & Reporting",
    description:
      "Screenshots, traces, and clear repro steps attached to every failing check, so developers can act without chasing context.",
    icon: FileText,
  },
];

type DemoStatus = "Queued" | "Running" | "Passed" | "Needs Review";

interface DemoCheck {
  id: string;
  name: string;
  status: DemoStatus;
}

const INITIAL_DEMO_CHECKS: DemoCheck[] = [
  { id: "check-1", name: "Checkout with saved card", status: "Queued" },
  { id: "check-2", name: "Login with invalid password", status: "Queued" },
  { id: "check-3", name: "API: create order schema", status: "Queued" },
  { id: "check-4", name: "Role-based access to admin panel", status: "Queued" },
];

const STATUS_SEQUENCE: DemoStatus[] = ["Queued", "Running", "Passed", "Needs Review"];

const STATUS_STYLES: Record<DemoStatus, { badge: string; icon: typeof Clock; dot: string }> = {
  Queued: {
    badge: "bg-white/5 text-[var(--muted-foreground)] border border-white/10",
    icon: Clock,
    dot: "bg-white/40",
  },
  Running: {
    badge: "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30",
    icon: Activity,
    dot: "bg-[var(--primary)]",
  },
  Passed: {
    badge: "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/40",
    icon: Check,
    dot: "bg-[var(--primary)]",
  },
  "Needs Review": {
    badge: "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/40",
    icon: AlertTriangle,
    dot: "bg-[var(--accent-secondary)]",
  },
};

interface CaseStudy {
  id: string;
  title: string;
  url?: string;
  kicker: string;
  context: string;
  challenge: string;
  responsibility: string;
  approach: string;
  scenarios: string[];
  tools: string[];
  learned: string;
  roadmap?: boolean;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "atomic-builder",
    title: "Atomic Builder",
    url: "https://builder.hotcode.ai/",
    kicker: "AI-powered product",
    context:
      "Atomic Builder is an AI-assisted build tool where users move through multi-step project creation and generation workflows.",
    challenge:
      "Generation states are inherently non-deterministic, so the usual 'expected output equals actual output' approach does not hold. The real risk sits in state transitions, not single screens.",
    responsibility:
      "I tested the user journeys around authentication, project setup, and generation states, focusing on where the product could silently fail or leave a user stuck.",
    approach:
      "I traced each multi-step journey end to end, deliberately interrupting flows midway, resubmitting forms, and testing with invalid or incomplete inputs to see how the system recovered.",
    scenarios: [
      "Authentication edge cases and session handling",
      "Interrupted or incomplete project workflows",
      "Validation and error handling on generation requests",
      "Loading and generation-state behavior under slow conditions",
      "Responsiveness across breakpoints",
      "Regression risk after UI changes",
    ],
    tools: ["Manual testing", "Exploratory testing", "Browser DevTools"],
    learned:
      "Testing AI-driven generation taught me to treat 'in progress' and 'failed silently' as distinct states worth testing on their own, not as footnotes to the happy path.",
  },
  {
    id: "veridatai",
    title: "VeridatAI",
    url: "https://veridat-demo.daticsai.com/",
    kicker: "Identity & verification workflows",
    context:
      "VeridatAI handles identity and document verification style workflows, where correctness and access control carry more weight than usual.",
    challenge:
      "Verification flows combine document handling, validation rules, and role-based access, which means a single broken edge case can expose or block the wrong data for the wrong user.",
    responsibility:
      "I tested the KYC-style verification journeys, document upload and validation behavior, and the boundaries between different access roles.",
    approach:
      "I worked through each role separately, checking what each one could and could not see or do, then layered in negative scenarios like malformed documents, duplicate submissions, and permission mismatches.",
    scenarios: [
      "Document upload and validation edge cases",
      "Role-based access boundaries",
      "Encryption-related behavior at rest and in transit",
      "Negative and invalid-input scenarios",
      "Usability of verification steps for non-technical users",
    ],
    tools: ["Manual testing", "Postman", "Browser DevTools"],
    learned:
      "Working on verification workflows sharpened how I think about role-based access. I now test 'what should be hidden' with the same rigor as 'what should be visible.'",
  },
  {
    id: "qa-assistant",
    title: "QA Assistant",
    kicker: "Personal AI-assisted QA prototype",
    context:
      "QA Assistant is an evolving prototype I'm building to explore how LLMs can support day-to-day QA work, starting with structured guidance generation.",
    challenge:
      "The working core needs to turn a loosely worded QA request into something structured and actually usable, without overpromising on what an early-stage assistant can do.",
    responsibility:
      "I designed and am testing the core request-to-response flow, and I'm honest with myself about which pieces are built versus planned.",
    approach:
      "The current build accepts a QA-related request, routes it through processing, and returns structured QA guidance such as suggested test scenarios or risk areas.",
    scenarios: [
      "Vague or incomplete QA requests",
      "Requests outside the assistant's intended scope",
      "Consistency of structured output across similar inputs",
    ],
    tools: ["Manual testing", "Prompt-level review"],
    learned:
      "Building this prototype myself gave me a much more grounded view of where AI-assisted QA tooling is genuinely useful today, versus where it still needs a human in the loop.",
  },
  {
    id: "library-management",
    title: "Library Management System",
    kicker: "Academic full-stack project",
    context:
      "An academic project building a library system with authentication, admin access, book management, and issue and return workflows.",
    challenge:
      "Keeping book availability, fines, and due dates in sync across concurrent issue and return actions, including admin overrides.",
    responsibility:
      "I worked on this as a development project, then applied QA thinking to test the workflows I built, which is distinct from my professional QA experience at DaticsAI.",
    approach:
      "I tested issue and return cycles against the database state directly, checking that fines calculated correctly against due dates and that admin actions did not desync book counts.",
    scenarios: [
      "Book issue and return cycles",
      "Fine calculation against due dates",
      "Admin versus member access boundaries",
      "Database synchronization after concurrent actions",
    ],
    tools: ["Manual testing", "SQL checks"],
    learned:
      "Building and testing the same system made the cost of a missing validation very concrete. It's part of why I now test with implementation risk in mind, not just UI behavior.",
  },
];

interface SystemNode {
  id: string;
  label: string;
  risks: string[];
  perspective: string;
}

const SYSTEM_NODES: SystemNode[] = [
  {
    id: "authentication",
    label: "Authentication",
    risks: ["Session fixation", "Weak password recovery", "Token expiry handling"],
    perspective:
      "I test login, logout, and session expiry together, since the gaps usually show up in the transitions between states, not the states themselves.",
  },
  {
    id: "payments",
    label: "Payments",
    risks: ["Double charges", "Failed webhook handling", "Currency rounding"],
    perspective:
      "I focus on what happens when a payment is interrupted or a webhook is delayed, since that's where money and order state can drift apart.",
  },
  {
    id: "kyc",
    label: "KYC Verification",
    risks: ["Document spoofing", "Validation bypass", "Role leakage"],
    perspective:
      "I treat verification steps as access-control problems first and document-processing problems second.",
  },
  {
    id: "rbac",
    label: "Role-Based Access",
    risks: ["Privilege escalation", "Stale permissions", "Hidden UI not actually blocked"],
    perspective:
      "I never trust that hiding a button means a role is blocked. I test the underlying request directly for every role.",
  },
  {
    id: "cloud-imports",
    label: "Cloud File Imports",
    risks: ["Partial uploads", "Unsupported formats", "Sync conflicts"],
    perspective:
      "I test interrupted and oversized imports deliberately, since those are the cases real users actually hit.",
  },
  {
    id: "realtime-chat",
    label: "Real-Time Chat",
    risks: ["Message ordering", "Reconnect handling", "Delivery duplication"],
    perspective:
      "I test with deliberately poor network conditions, since most chat bugs only appear mid-reconnect.",
  },
  {
    id: "ai-content",
    label: "AI-Generated Content",
    risks: ["Inconsistent output", "Silent failures", "Unclear loading states"],
    perspective:
      "I test generation as a process with states, not a single output, so I can catch 'stuck' and 'silently failed' separately.",
  },
  {
    id: "data-validation",
    label: "Data Validation",
    risks: ["Boundary values", "Encoding issues", "Inconsistent server/client rules"],
    perspective:
      "I always test the same validation rule on both the UI and the API, since they drift apart more often than teams expect.",
  },
  {
    id: "error-recovery",
    label: "Error Recovery",
    risks: ["Lost user input", "Unclear error messaging", "Retry loops"],
    perspective:
      "A good error state should tell the user what to do next. I test for that clarity, not just that an error appears.",
  },
  {
    id: "cross-platform",
    label: "Cross-Platform Behavior",
    risks: ["Layout breakage", "Platform-specific gestures", "Inconsistent feature parity"],
    perspective:
      "I compare the same flow across web, mobile, and desktop directly, since subtle parity gaps are easy to miss testing each in isolation.",
  },
];

interface ToolGroup {
  id: string;
  title: string;
  items: string[];
}

const TOOL_GROUPS: ToolGroup[] = [
  { id: "automation", title: "Automation", items: ["Playwright"] },
  { id: "api-performance", title: "API & Performance", items: ["Postman", "JMeter"] },
  {
    id: "testing",
    title: "Testing",
    items: [
      "Manual testing",
      "Functional testing",
      "Regression testing",
      "Exploratory testing",
      "Usability testing",
      "Compatibility testing",
    ],
  },
  {
    id: "technical-foundation",
    title: "Technical Foundation",
    items: [
      "Front-end development knowledge",
      "Web application architecture",
      "Browser developer tools",
      "AI and agentic workflow fundamentals",
    ],
  },
];

interface Principle {
  id: string;
  title: string;
  description: string;
}

const PRINCIPLES: Principle[] = [
  {
    id: "user-journey",
    title: "Understand the user journey before writing test cases.",
    description:
      "I spend time walking through the product the way a real user would before I write a single test case. Cases written without that context tend to test the code, not the experience.",
  },
  {
    id: "beyond-happy-path",
    title: "Test beyond the happy path.",
    description:
      "The happy path almost always works. I spend more time on incomplete actions, invalid data, and interrupted workflows, because that's where real defects live.",
  },
  {
    id: "reproducible-defects",
    title: "Make every defect easy to reproduce.",
    description:
      "A defect report that can't be reproduced wastes everyone's time. I write steps, environment, and evidence clearly enough that anyone on the team can follow them.",
  },
  {
    id: "automate-wisely",
    title: "Automate stable, valuable regression paths, not everything blindly.",
    description:
      "Not every test deserves automation. I automate the paths that are stable and high-value, and keep exploratory judgment for the areas that still change often.",
  },
];

interface ArchitectureStep {
  id: string;
  label: string;
  description: string;
}

const ARCHITECTURE_STEPS: ArchitectureStep[] = [
  { id: "request", label: "User Request", description: "A QA-related question or task is submitted in plain language." },
  { id: "workflow", label: "QA Workflow", description: "The request is routed into a QA-specific processing path." },
  { id: "llm", label: "LLM Processing", description: "The model reasons about testing scope, risk areas, and structure." },
  { id: "response", label: "Structured QA Response", description: "The output returns as organized guidance, such as scenarios or risk notes." },
];

const ROADMAP_ITEMS: string[] = [
  "Full retrieval-augmented generation (RAG) over project documentation",
  "Database persistence for request history and generated guidance",
  "Browser execution to validate suggested scenarios directly",
  "Multi-agent collaboration between planning and execution roles",
  "Production deployment with proper access controls",
];

// ---------------------------------------------------------------------------
// Hero 3D cube
// ---------------------------------------------------------------------------

function HeroCube() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-16, 16]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setActiveLayer((prev) => (prev + 1) % CUBE_LAYERS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [reduce]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!mounted) {
    return <div className="aspect-square w-full max-w-sm" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative aspect-square w-full max-w-sm select-none"
        style={{ perspective: 900 }}
      >
        <motion.div
          className="relative h-full w-full rounded-3xl"
          style={
            reduce
              ? undefined
              : { rotateX, rotateY, transformStyle: "preserve-3d" }
          }
        >
          <div className="glass-panel absolute inset-4 flex flex-col justify-between gap-2 overflow-hidden rounded-2xl p-5">
            {CUBE_LAYERS.map((layer, index) => (
              <div
                key={layer.id}
                className={`relative flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-medium tracking-wide transition-colors duration-500 ${
                  index === activeLayer
                    ? "border-[var(--primary)]/50 bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)]"
                }`}
              >
                <span>{layer.label}</span>
                <Circle
                  className={`h-2.5 w-2.5 transition-colors duration-500 ${
                    index === activeLayer ? "fill-[var(--primary)] text-[var(--primary)]" : "fill-white/20 text-white/20"
                  }`}
                />
                {index === activeLayer && !reduce && (
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--primary)]/25 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "300%" }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      <p className="text-center text-sm italic text-[var(--muted-foreground)]">
        "Testing beyond the happy path."
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const [activeDiscipline, setActiveDiscipline] = useState<string>(EXPERTISE[0].id);
  const [activeNode, setActiveNode] = useState<string>(SYSTEM_NODES[0].id);
  const [activeArchStep, setActiveArchStep] = useState<string>(ARCHITECTURE_STEPS[0].id);
  const [demoChecks, setDemoChecks] = useState<DemoCheck[]>(INITIAL_DEMO_CHECKS);
  const [demoRunning, setDemoRunning] = useState(false);
  const workflowRef = useRef<HTMLDivElement>(null);
  const [workflowActive, setWorkflowActive] = useState(false);

  const selectedDiscipline = useMemo(
    () => EXPERTISE.find((item) => item.id === activeDiscipline) ?? EXPERTISE[0],
    [activeDiscipline]
  );

  const selectedNode = useMemo(
    () => SYSTEM_NODES.find((item) => item.id === activeNode) ?? SYSTEM_NODES[0],
    [activeNode]
  );

  const selectedArchStep = useMemo(
    () => ARCHITECTURE_STEPS.find((item) => item.id === activeArchStep) ?? ARCHITECTURE_STEPS[0],
    [activeArchStep]
  );

  useEffect(() => {
    const node = workflowRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWorkflowActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const runDemo = () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoChecks(INITIAL_DEMO_CHECKS.map((check) => ({ ...check, status: "Queued" })));

    const finalStatuses: DemoStatus[] = ["Passed", "Passed", "Needs Review", "Passed"];

    demoChecks.forEach((_, index) => {
      const baseDelay = index * 650;
      setTimeout(() => {
        setDemoChecks((prev) =>
          prev.map((check, i) => (i === index ? { ...check, status: "Running" } : check))
        );
      }, baseDelay + 300);
      setTimeout(() => {
        setDemoChecks((prev) =>
          prev.map((check, i) =>
            i === index ? { ...check, status: finalStatuses[index] ?? "Passed" } : check
          )
        );
      }, baseDelay + 1200);
    });

    setTimeout(() => setDemoRunning(false), INITIAL_DEMO_CHECKS.length * 650 + 1200);
  };

  return (
    <main className="bg-ambient min-h-screen text-[var(--foreground)]">
      {/* ----------------------------------------------------------------- */}
      {/* Hero */}
      {/* ----------------------------------------------------------------- */}
      <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-44">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)]/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              Open to new QA opportunities
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
            >
              {APP_NAME}
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-3 text-lg font-medium text-[var(--primary)] md:text-xl"
            >
              {TAGLINE}
            </motion.p>

            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg"
            >
              I test products from the user's perspective and the system's edge cases, turning
              unclear behavior into reproducible bugs, reliable automated checks, and better
              releases.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#case-studies"
                className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                View My Work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={RESUME_URL}
                download
                className="btn-secondary-outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-300 hover:border-white/30"
              >
                Download Résumé
                <Download className="h-4 w-4" aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap items-center gap-5 text-sm text-[var(--muted-foreground)]"
            >
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors duration-200 hover:text-[var(--primary)]"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 transition-colors duration-200 hover:text-[var(--primary)]"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-2 transition-colors duration-200 hover:text-[var(--primary)]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {EMAIL}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex justify-center"
          >
            <HeroCube />
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* About */}
      {/* ----------------------------------------------------------------- */}
      <section id="about" className="border-t border-white/5 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              About
            </span>
            <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Quality is a design problem, not an afterthought.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 space-y-5 text-pretty text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
              <p>
                I currently work as a Software Development Engineer in Test at{" "}
                <span className="font-medium text-[var(--foreground)]">DaticsAI</span>, where I test
                web, mobile, and desktop applications throughout their development lifecycle.
                Day to day that means a mix of manual testing, browser automation with
                Playwright, API validation, and performance checks, depending on what the
                release actually needs.
              </p>
              <p>
                I spend a lot of time on regression coverage and defect investigation,
                because that is where releases usually get derailed. I write reports that
                include clear reproduction steps and evidence, and I work closely with
                developers and product stakeholders to make sure requirements are
                understood before a test case is even written.
              </p>
              <p>
                My earlier front-end development background still shapes how I work. It
                helps me investigate UI problems faster, read a stack trace without
                guessing, and have more precise conversations with developers about what is
                actually happening under the hood.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Testing expertise matrix */}
      {/* ----------------------------------------------------------------- */}
      <section id="expertise-matrix" className="border-t border-white/5 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Expertise
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Ten testing disciplines, one way of thinking.
            </h2>
            <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-[var(--muted-foreground)]">
              Select an area to see how I actually approach it, not a textbook definition.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                {EXPERTISE.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveDiscipline(item.id)}
                    aria-pressed={activeDiscipline === item.id}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 ${
                      activeDiscipline === item.id
                        ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)] hover:border-white/20 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <motion.div
                key={selectedDiscipline.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-panel h-full p-8"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
                  {selectedDiscipline.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-[var(--primary)]">
                  {selectedDiscipline.summary}
                </p>
                <p className="mt-5 text-pretty leading-relaxed text-[var(--muted-foreground)]">
                  {selectedDiscipline.approach}
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Automation laboratory */}
      {/* ----------------------------------------------------------------- */}
      <section id="automation-lab" className="border-t border-white/5 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Automation Lab
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              From requirement to regression coverage.
            </h2>
          </Reveal>

          <div ref={workflowRef} className="mt-14 overflow-x-auto pb-4">
            <div className="flex min-w-[760px] items-center gap-2">
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-1 items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={workflowActive ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                      className="glass-panel flex flex-1 flex-col items-center gap-3 px-3 py-5 text-center"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-medium leading-tight text-[var(--muted-foreground)]">
                        {step.label}
                      </span>
                    </motion.div>
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-white/15" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <div className="glass-panel overflow-hidden">
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-5 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="ml-2 text-xs text-[var(--muted-foreground)]">checkout.spec.ts</span>
                </div>
                <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-[var(--muted-foreground)] md:text-sm">
                  <code>
                    {PLAYWRIGHT_SAMPLE.split("\n").map((line, i) => (
                      <div key={i} className="whitespace-pre">
                        {line.includes("import") || line.includes("test(") || line.includes("await") ? (
                          <span className="text-[var(--primary)]">{line}</span>
                        ) : (
                          <span>{line}</span>
                        )}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                    Demonstration Test Run
                  </h3>
                  <button
                    type="button"
                    onClick={runDemo}
                    disabled={demoRunning}
                    className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors duration-300 hover:bg-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {demoRunning ? "Running..." : "Run Demo"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Interactive demonstration only, not live production data.
                </p>
                <div className="mt-5 space-y-2.5">
                  {demoChecks.map((check) => {
                    const style = STATUS_STYLES[check.status];
                    const StatusIcon = style.icon;
                    return (
                      <div
                        key={check.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-[var(--foreground)]">{check.name}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}
                        >
                          <StatusIcon className="h-3 w-3" aria-hidden="true" />
                          {check.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LAB_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.id} delay={index * 0.05}>
                  <div className="glass-panel glass-panel-hover h-full p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {card.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Professional experience */}
      {/* ----------------------------------------------------------------- */}
      <section id="experience-timeline" className="border-t border-white/5 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Experience
            </span>
            <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Software Development Engineer in Test
            </h2>
            <p className="mt-2 text-sm font-medium text-[var(--primary)]">DaticsAI</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-10 border-l border-white/10 pl-8">
              {[
                "Test web, mobile, and desktop applications throughout the development lifecycle.",
                "Design and execute manual and automated test scenarios.",
                "Build and maintain Playwright browser automation.",
                "Validate APIs and backend behavior using Postman.",
                "Perform performance and load-testing exercises with JMeter in approved QA environments.",
                "Investigate defects and document reproducible steps, evidence, expected behavior, and actual behavior.",
                "Verify fixes and execute regression testing before releases.",
                "Collaborate with developers and product stakeholders to clarify requirements and reduce release risk.",
                "Test complex workflows involving authentication, role-based access, payments, KYC verification, cloud file imports, encryption-related behavior, real-time chat, and AI-generated content.",
              ].map((item, index) => (
                <div key={index} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[2.3rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] bg-[var(--primary)]" />
                  <p className="text-pretty leading-relaxed text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Case studies */}
      {/* ----------------------------------------------------------------- */}
      <section id="case-studies" className="border-t border-white/5 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Case Studies
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Real products, real testing decisions.
            </h2>
          </Reveal>

          <div className="mt-14 space-y-16">
            {CASE_STUDIES.map((study, index) => (
              <Reveal key={study.id} delay={index * 0.05}>
                <article
                  className={`glass-panel grid gap-8 p-8 md:p-10 lg:grid-cols-[0.8fr_1.2fr] ${
                    study.id === "qa-assistant" ? "border-[var(--accent-secondary)]/20" : ""
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                      {study.kicker}
                    </span>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
                      {study.title}
                    </h3>
                    {study.url && (
                      <a
                        href={study.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                      >
                        {study.url.replace("https://", "")}
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                      {study.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {study.id === "qa-assistant" && (
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/10 px-3 py-1 text-xs font-semibold text-[var(--accent-secondary)]">
                          Roadmap, not shipped
                        </span>
                        <div className="mt-4 space-y-2">
                          {ARCHITECTURE_STEPS.map((step) => (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => setActiveArchStep(step.id)}
                              className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors duration-200 ${
                                activeArchStep === step.id
                                  ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                                  : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)]"
                              }`}
                            >
                              {step.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                          {selectedArchStep.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Product Context
                      </h4>
                      <p className="mt-1.5 text-pretty">{study.context}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Quality Challenge
                      </h4>
                      <p className="mt-1.5 text-pretty">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Rao's Responsibility
                      </h4>
                      <p className="mt-1.5 text-pretty">{study.responsibility}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Testing Approach
                      </h4>
                      <p className="mt-1.5 text-pretty">{study.approach}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        Important Scenarios
                      </h4>
                      <ul className="mt-1.5 space-y-1">
                        {study.scenarios.map((scenario) => (
                          <li key={scenario} className="flex gap-2">
                            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--primary)]" aria-hidden="true" />
                            <span>{scenario}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                        What Was Learned
                      </h4>
                      <p className="mt-1.5 text-pretty">{study.learned}</p>
                    </div>

                    {study.id === "qa-assistant" && (
                      <div className="rounded-xl border border-[var(--accent-secondary)]/25 bg-[var(--accent-secondary)]/5 p-5">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-secondary)]">
                          Planned Roadmap
                        </h4>
                        <ul className="mt-2.5 space-y-1.5">
                          {ROADMAP_ITEMS.map((item) => (
                            <li key={item} className="flex gap-2 text-xs">
                              <Circle className="mt-1 h-1.5 w-1.5 flex-shrink-0 fill-[var(--accent-secondary)] text-[var(--accent-secondary)]" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Systems tested */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t border-white/5 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Systems I Have Tested
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              The workflows most likely to break in production.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {SYSTEM_NODES.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setActiveNode(node.id)}
                    aria-pressed={activeNode === node.id}
                    className={`rounded-xl border px-3 py-3.5 text-left text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 ${
                      activeNode === node.id
                        ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-white/10 bg-white/[0.02] text-[var(--muted-foreground)] hover:border-white/20 hover:text-[var(--foreground)]"
                    }`}
                  >
                    {node.label}
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="glass-panel h-full p-7"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
                  {selectedNode.label}
                </h3>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Common Quality Risks
                </p>
                <ul className="mt-2 space-y-1.5">
                  {selectedNode.risks.map((risk) => (
                    <li key={risk} className="flex gap-2 text-sm text-[var(--muted-foreground)]">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--accent-secondary)]" aria-hidden="true" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {selectedNode.perspective}
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Tools & skills */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t border-white/5 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Tools & Skills
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Grouped by how they're actually used.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOL_GROUPS.map((group, index) => (
              <Reveal key={group.id} delay={index * 0.05}>
                <div className="glass-panel glass-panel-hover h-full p-6">
                  <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                    {group.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-[var(--foreground)]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Quality principles */}
      {/* ----------------------------------------------------------------- */}
      <section className="border-t border-white/5 bg-white/[0.015] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              How I Think About Quality
            </span>
            <h2 className="mt-3 max-w-2xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Four principles that shape every test plan.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.id} delay={index * 0.05}>
                <div className="glass-panel h-full p-7">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--primary)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-pretty font-[family-name:var(--font-display)] text-lg font-semibold leading-snug">
                    {principle.title}
                  </h3>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {principle.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Contact */}
      {/* ----------------------------------------------------------------- */}
      <section id="contact" className="border-t border-white/5 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              Contact
            </span>
            <h2 className="mt-3 text-balance font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
              Let's talk about your next release.
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-[var(--muted-foreground)]">
              Open to SDET and QA engineer roles. The fastest way to reach me is email.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a
                href={`mailto:${EMAIL}`}
                className="btn-primary-glow inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--background)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {EMAIL}
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-300 hover:border-white/30"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary-outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors duration-300 hover:border-white/30"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
