
/**
 * Deterministic Chaos Engine
 * Used to simulate system failures and test recovery invariants.
 */

export class ChaosEngine {
  private static activeScenarios: Set<string> = new Set();

  public static activate(scenarioId: string) {
    this.activeScenarios.add(scenarioId);
    console.log(`[CHAOS] Scenario activated: ${scenarioId}`);
  }

  public static deactivate(scenarioId: string) {
    this.activeScenarios.delete(scenarioId);
    console.log(`[CHAOS] Scenario deactivated: ${scenarioId}`);
  }

  public static isScenarioActive(scenarioId: string): boolean {
    return this.activeScenarios.has(scenarioId);
  }

  /**
   * Deterministically corrupts data if the relevant chaos scenario is active.
   */
  public static processInvariants<T>(data: T, scenarioId: string, transform: (d: T) => T): T {
    if (this.isScenarioActive(scenarioId)) {
      return transform(data);
    }
    return data;
  }
}
