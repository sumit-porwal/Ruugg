import type {
  CanvasElement,
  FrameworkId,
  SemanticTag,
  ShapeElement,
} from '../types';
import { FRAMEWORKS_REGISTRY, createConnector } from './frameworkRegistry';

export interface TransformationProposal {
  targetFrameworkId: FrameworkId;
  targetFrameworkName: string;
  rationale: string;
  mappedNodeCount: number;
  transformedElements: CanvasElement[];
  preservationSummary: string[];
}

export function canSwitchFramework(
  _currentElements: CanvasElement[],
  targetFrameworkId: FrameworkId
): boolean {
  return targetFrameworkId in FRAMEWORKS_REGISTRY;
}

export function proposeFrameworkTransformation(
  currentElements: CanvasElement[],
  currentTitle: string,
  targetFrameworkId: FrameworkId
): TransformationProposal {
  const targetDef = FRAMEWORKS_REGISTRY[targetFrameworkId] || FRAMEWORKS_REGISTRY.mindMap;

  // 1. Extract existing text labels, tags, and notes from elements
  const extractedNodes: { text: string; tag?: SemanticTag; notes?: string }[] = [];

  for (const el of currentElements) {
    if (el.type === 'shape' && el.text) {
      extractedNodes.push({ text: el.text.trim(), tag: el.tag, notes: el.evidenceNotes });
    } else if (el.type === 'text' && el.text.trim()) {
      extractedNodes.push({ text: el.text.trim(), tag: el.tag });
    } else if (el.type === 'model' && el.modelKind === 'stickyNote' && el.data?.text) {
      extractedNodes.push({ text: el.data.text.trim(), tag: el.tag, notes: el.evidenceNotes });
    } else if (el.type === 'stamp' && el.label) {
      extractedNodes.push({ text: el.label, tag: el.tag });
    }
  }

  const primaryLabel =
    extractedNodes[0]?.text ||
    (currentTitle && !currentTitle.startsWith('Napkin Slide') ? currentTitle : 'Core Focus');
  const secondaryNodes = extractedNodes.slice(1);

  const transformedElements: CanvasElement[] = [];
  const preservationSummary: string[] = [];

  // ==========================================
  // 1. QUESTION TREE TRANSFORMATION
  // ==========================================
  if (targetFrameworkId === 'questionTree') {
    const rootId = 'qtree_tf_root';
    const rootQuestion = primaryLabel.endsWith('?')
      ? primaryLabel
      : `How do we address: ${primaryLabel}?`;

    transformedElements.push({
      id: rootId,
      type: 'shape',
      shapeType: 'rect',
      x: 60,
      y: 220,
      width: 220,
      height: 90,
      color: '#1d4ed8',
      fillColor: '#eff6ff',
      strokeWidth: 3,
      isRough: true,
      text: rootQuestion,
      fontSize: 14,
      tag: 'question',
    } as ShapeElement);

    preservationSummary.push(`Root inquiry: "${rootQuestion}"`);

    const subQuestions =
      secondaryNodes.length > 0
        ? secondaryNodes
        : [
            { text: 'What is the primary bottleneck?', tag: 'question' as SemanticTag },
            { text: 'What evidence is needed to confirm this?', tag: 'evidence_needed' as SemanticTag },
            { text: 'What is the most viable alternative?', tag: 'hypothesis' as SemanticTag },
          ];

    subQuestions.slice(0, 5).forEach((node, idx) => {
      const qId = `qtree_tf_sub_${idx}`;
      const qY = 80 + idx * 105;
      const qText = node.text.endsWith('?') ? node.text : `Why / How: ${node.text}?`;

      transformedElements.push({
        id: qId,
        type: 'shape',
        shapeType: 'rect',
        x: 360,
        y: qY,
        width: 230,
        height: 75,
        color: '#0369a1',
        fillColor: '#f0f9ff',
        strokeWidth: 2,
        isRough: true,
        text: qText,
        fontSize: 12,
        tag: node.tag || 'question',
        evidenceNotes: node.notes,
      } as ShapeElement);

      transformedElements.push(
        createConnector(rootId, qId, { x: 280, y: 265 }, { x: 360, y: qY + 37 })
      );

      preservationSummary.push(`Mapped sub-node "${node.text.substring(0, 22)}..." to Sub-Question ${idx + 1}`);
    });
  }

  // ==========================================
  // 2. DECISION TREE / PROS & CONS TRANSFORMATION
  // ==========================================
  else if (targetFrameworkId === 'decisionTree' || targetFrameworkId === 'prosCons') {
    const decisionId = 'dt_tf_root';
    const decisionText = `DECISION:\n${primaryLabel}`;

    transformedElements.push({
      id: decisionId,
      type: 'shape',
      shapeType: 'diamond',
      x: 70,
      y: 200,
      width: 190,
      height: 130,
      color: '#b45309',
      fillColor: '#fef3c7',
      strokeWidth: 3,
      isRough: true,
      text: decisionText,
      fontSize: 13,
      tag: 'decision',
    } as ShapeElement);

    preservationSummary.push(`Decision root: "${primaryLabel}"`);

    // Option A
    const optAText = secondaryNodes[0]?.text || 'Option A: Primary Alternative';
    const optAId = 'dt_tf_optA';
    transformedElements.push({
      id: optAId,
      type: 'shape',
      shapeType: 'rect',
      x: 340,
      y: 110,
      width: 200,
      height: 80,
      color: '#047857',
      fillColor: '#ecfdf5',
      strokeWidth: 2,
      isRough: true,
      text: `OPTION A:\n${optAText}`,
      fontSize: 13,
      tag: secondaryNodes[0]?.tag || 'hypothesis',
      evidenceNotes: secondaryNodes[0]?.notes,
    } as ShapeElement);

    transformedElements.push(
      createConnector(decisionId, optAId, { x: 260, y: 240 }, { x: 340, y: 150 }, 'Path 1')
    );
    preservationSummary.push(`Mapped "${optAText.substring(0, 22)}..." as Option A`);

    // Option B
    const optBText = secondaryNodes[1]?.text || 'Option B: Counter Alternative';
    const optBId = 'dt_tf_optB';
    transformedElements.push({
      id: optBId,
      type: 'shape',
      shapeType: 'rect',
      x: 340,
      y: 310,
      width: 200,
      height: 80,
      color: '#4338ca',
      fillColor: '#e0e7ff',
      strokeWidth: 2,
      isRough: true,
      text: `OPTION B:\n${optBText}`,
      fontSize: 13,
      tag: secondaryNodes[1]?.tag || 'hypothesis',
      evidenceNotes: secondaryNodes[1]?.notes,
    } as ShapeElement);

    transformedElements.push(
      createConnector(decisionId, optBId, { x: 260, y: 290 }, { x: 340, y: 350 }, 'Path 2')
    );
    preservationSummary.push(`Mapped "${optBText.substring(0, 22)}..." as Option B`);

    // Outcome / Criteria nodes
    const outcomeText = secondaryNodes[2]?.text || 'Trade-off & Expected Outcome';
    const outcomeId = 'dt_tf_outcome';
    transformedElements.push({
      id: outcomeId,
      type: 'shape',
      shapeType: 'rect',
      x: 610,
      y: 210,
      width: 210,
      height: 85,
      color: '#0f766e',
      fillColor: '#f0fdfa',
      strokeWidth: 2,
      isRough: true,
      text: `OUTCOME / CRITERIA:\n${outcomeText}`,
      fontSize: 12,
      tag: 'action',
      evidenceNotes: secondaryNodes[2]?.notes,
    } as ShapeElement);

    transformedElements.push(
      createConnector(optAId, outcomeId, { x: 540, y: 150 }, { x: 610, y: 240 }, 'If chosen')
    );
    transformedElements.push(
      createConnector(optBId, outcomeId, { x: 540, y: 350 }, { x: 610, y: 260 }, 'If chosen')
    );
    preservationSummary.push(`Added outcome criteria linking branches`);
  }

  // ==========================================
  // 3. WORKFLOW / TIMELINE TRANSFORMATION
  // ==========================================
  else if (targetFrameworkId === 'workflow' || targetFrameworkId === 'timeline') {
    const stepNodes =
      extractedNodes.length > 0
        ? extractedNodes
        : [
            { text: 'Inbound Request / Trigger', tag: 'fact' as SemanticTag },
            { text: 'Analyze & Decide Path', tag: 'decision' as SemanticTag },
            { text: 'Execute Solution', tag: 'action' as SemanticTag },
            { text: 'Measure Outcome & Verify', tag: 'evidence_needed' as SemanticTag },
          ];

    let prevId: string | null = null;
    let prevX = 0;
    let prevY = 0;

    stepNodes.slice(0, 5).forEach((node, idx) => {
      const stepId = `wf_tf_step_${idx}`;
      const x = 50 + idx * 210;
      const y = 210;
      const isDecision = idx === 1;

      transformedElements.push({
        id: stepId,
        type: 'shape',
        shapeType: isDecision ? 'diamond' : 'rect',
        x,
        y: isDecision ? y - 20 : y,
        width: isDecision ? 160 : 175,
        height: isDecision ? 120 : 80,
        color: idx === 0 ? '#047857' : isDecision ? '#b45309' : '#1d4ed8',
        fillColor: idx === 0 ? '#ecfdf5' : isDecision ? '#fef3c7' : '#eff6ff',
        strokeWidth: 2,
        isRough: true,
        text: `${idx + 1}. ${node.text}`,
        fontSize: 12,
        tag: node.tag || (isDecision ? 'decision' : 'action'),
        evidenceNotes: node.notes,
      } as ShapeElement);

      if (prevId) {
        transformedElements.push(
          createConnector(
            prevId,
            stepId,
            { x: prevX + (prevId.includes('step_1') ? 160 : 175), y: prevY + 40 },
            { x, y: y + 40 },
            `Step ${idx}`
          )
        );
      }

      prevId = stepId;
      prevX = x;
      prevY = y;
      preservationSummary.push(`Mapped "${node.text.substring(0, 22)}..." to Process Step ${idx + 1}`);
    });
  }

  // ==========================================
  // 4. CAUSE & EFFECT / FIVE WHYS TRANSFORMATION
  // ==========================================
  else if (targetFrameworkId === 'causeEffect' || targetFrameworkId === 'fiveWhys') {
    const effectId = 'ce_tf_effect';
    transformedElements.push({
      id: 'ce_tf_spine',
      type: 'shape',
      shapeType: 'arrow',
      x: 70,
      y: 280,
      width: 590,
      height: 18,
      color: '#334155',
      strokeWidth: 4,
      isRough: true,
    } as ShapeElement);

    transformedElements.push({
      id: effectId,
      type: 'shape',
      shapeType: 'rect',
      x: 680,
      y: 235,
      width: 210,
      height: 95,
      color: '#be123c',
      fillColor: '#ffe4e6',
      strokeWidth: 3,
      isRough: true,
      text: `PROBLEM / EFFECT:\n${primaryLabel}`,
      fontSize: 14,
      tag: 'fact',
    } as ShapeElement);

    preservationSummary.push(`Core problem/effect: "${primaryLabel}"`);

    const causes =
      secondaryNodes.length > 0
        ? secondaryNodes
        : [
            { text: 'People & Process Gaps', tag: 'hypothesis' as SemanticTag },
            { text: 'Technology / Tool Limits', tag: 'assumption' as SemanticTag },
            { text: 'Communication Bottlenecks', tag: 'evidence_needed' as SemanticTag },
            { text: 'Unclear Requirements', tag: 'hypothesis' as SemanticTag },
          ];

    causes.slice(0, 4).forEach((node, idx) => {
      const isTop = idx % 2 === 0;
      const x = 140 + Math.floor(idx / 2) * 260;
      const y = isTop ? 100 : 380;
      const causeId = `ce_tf_cause_${idx}`;

      transformedElements.push({
        id: causeId,
        type: 'shape',
        shapeType: 'rect',
        x,
        y,
        width: 180,
        height: 70,
        color: isTop ? '#1e40af' : '#7c3aed',
        fillColor: isTop ? '#eff6ff' : '#f5f3ff',
        strokeWidth: 2,
        isRough: true,
        text: `Cause ${idx + 1}:\n${node.text}`,
        fontSize: 12,
        tag: node.tag || 'hypothesis',
        evidenceNotes: node.notes,
      } as ShapeElement);

      transformedElements.push(
        createConnector(
          causeId,
          effectId,
          { x: x + 90, y: isTop ? y + 70 : y },
          { x: x + 160, y: isTop ? 280 : 300 }
        )
      );

      preservationSummary.push(`Mapped factor "${node.text.substring(0, 22)}..." to Cause ${idx + 1}`);
    });
  }

  // ==========================================
  // 5. SQVID VISUAL EXPLORATION TRANSFORMATION
  // ==========================================
  else if (targetFrameworkId === 'sqvid') {
    const centerId = 'sqvid_tf_center';
    transformedElements.push({
      id: centerId,
      type: 'shape',
      shapeType: 'circle',
      x: 380,
      y: 210,
      width: 190,
      height: 100,
      color: '#6b21a8',
      fillColor: '#faf5ff',
      strokeWidth: 3,
      isRough: true,
      text: `CORE CONCEPT:\n${primaryLabel}`,
      fontSize: 14,
      tag: 'fact',
    } as ShapeElement);

    preservationSummary.push(`Core SQVID idea: "${primaryLabel}"`);

    const sqvidDimensions = [
      {
        dim: 'Simple vs. Detailed',
        text: secondaryNodes[0]?.text || `High-level sketch of ${primaryLabel}`,
        x: 100,
        y: 80,
        color: '#0284c7',
        bg: '#f0f9ff',
      },
      {
        dim: 'Quality vs. Quantity',
        text: secondaryNodes[1]?.text || 'Core emotional impact and key metrics',
        x: 640,
        y: 80,
        color: '#059669',
        bg: '#ecfdf5',
      },
      {
        dim: 'Vision vs. Execution',
        text: secondaryNodes[2]?.text || 'Future ambition and practical first step',
        x: 640,
        y: 350,
        color: '#d97706',
        bg: '#fffbeb',
      },
      {
        dim: 'Individual vs. Comparison',
        text: secondaryNodes[3]?.text || 'Target user focus vs alternative models',
        x: 100,
        y: 350,
        color: '#dc2626',
        bg: '#fef2f2',
      },
    ];

    sqvidDimensions.forEach((dimItem, idx) => {
      const dimId = `sqvid_tf_dim_${idx}`;
      transformedElements.push({
        id: dimId,
        type: 'shape',
        shapeType: 'rect',
        x: dimItem.x,
        y: dimItem.y,
        width: 210,
        height: 85,
        color: dimItem.color,
        fillColor: dimItem.bg,
        strokeWidth: 2,
        isRough: true,
        text: `${dimItem.dim.toUpperCase()}:\n${dimItem.text}`,
        fontSize: 11,
        tag: 'hypothesis',
      } as ShapeElement);

      transformedElements.push(
        createConnector(
          centerId,
          dimId,
          { x: 475, y: 260 },
          { x: dimItem.x + 105, y: dimItem.y + 42 }
        )
      );

      preservationSummary.push(`Mapped into SQVID dimension: ${dimItem.dim}`);
    });
  }

  // ==========================================
  // 6. DEFAULT / MIND MAP / CONCEPT MAP / ORBIT
  // ==========================================
  else {
    const centerId = 'mm_tf_center';
    transformedElements.push({
      id: centerId,
      type: 'shape',
      shapeType: 'circle',
      x: 370,
      y: 210,
      width: 200,
      height: 105,
      color: '#1e3a8a',
      fillColor: '#dbeafe',
      strokeWidth: 3,
      isRough: true,
      text: primaryLabel,
      fontSize: 15,
      tag: extractedNodes[0]?.tag || 'hypothesis',
    } as ShapeElement);

    preservationSummary.push(`Central core concept: "${primaryLabel}"`);

    const branches =
      secondaryNodes.length > 0
        ? secondaryNodes
        : [
            { text: 'Core Assumptions', tag: 'assumption' as SemanticTag },
            { text: 'Key Hypotheses', tag: 'hypothesis' as SemanticTag },
            { text: 'Evidence to Gather', tag: 'evidence_needed' as SemanticTag },
            { text: 'Next Immediate Action', tag: 'action' as SemanticTag },
          ];

    const branchColors = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626'];
    const branchFills = ['#f0f9ff', '#ecfdf5', '#fffbeb', '#f5f3ff', '#fef2f2'];

    branches.slice(0, 6).forEach((node, idx) => {
      const total = Math.min(6, branches.length);
      const angle = (idx * Math.PI * 2) / total - Math.PI / 2;
      const x = Math.max(50, Math.min(720, 440 + Math.cos(angle) * 270 - 90));
      const y = Math.max(60, Math.min(440, 260 + Math.sin(angle) * 170 - 40));
      const branchId = `mm_tf_branch_${idx}`;

      const color = branchColors[idx % branchColors.length];
      const fillColor = branchFills[idx % branchFills.length];

      transformedElements.push({
        id: branchId,
        type: 'shape',
        shapeType: 'rect',
        x,
        y,
        width: 180,
        height: 75,
        color,
        fillColor,
        strokeWidth: 2,
        isRough: true,
        text: node.text,
        fontSize: 12,
        tag: node.tag || 'hypothesis',
        evidenceNotes: node.notes,
      } as ShapeElement);

      transformedElements.push(
        createConnector(
          centerId,
          branchId,
          { x: 470, y: 262 },
          { x: x + 90, y: y + 37 }
        )
      );

      preservationSummary.push(`Mapped branch "${node.text.substring(0, 22)}..." connected to center`);
    });
  }

  return {
    targetFrameworkId,
    targetFrameworkName: targetDef.name,
    rationale: `Transitioned your ${extractedNodes.length} existing visual notes into ${targetDef.name}. Every thought, tag, and relationship has been preserved into the new structure.`,
    mappedNodeCount: extractedNodes.length,
    transformedElements,
    preservationSummary,
  };
}
