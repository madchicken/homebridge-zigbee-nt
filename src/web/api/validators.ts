export interface BindCommand {
  target: string;
  clusters: string[];
}

export interface ValidationError {
  field: string;
  rejectedValue: any;
  message: string;
}

const clusters = [
  'genScenes',
  'genOnOff',
  'genLevelCtrl',
  'lightingColorCtrl',
  'closuresWindowCovering',
];

export function validateBindCommand(command: BindCommand): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!command.target) {
    errors.push({
      field: 'target',
      rejectedValue: command.target,
      message: 'You must provide a valid target (ieeeAddress)',
    });
  }
  if (!command.clusters) {
    errors.push({
      field: 'clusters',
      rejectedValue: command.clusters,
      message: `You must provide a valid set of clusters (${clusters.join(', ')})`,
    });
  }
  return errors;
}
