export type Finding = {
  ruleId: string;
  message: string;
  line?: number;
  column?: number;
};

export type Rule = {
  id: string;
  description: string;
  check: (node: any) => Finding[];
};

export type AnalysisResult = {
  findings: Finding[];
  warnings: Warning[];
};

export type Warning = {
  message: string;
};
