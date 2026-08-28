# Technical plausibility boundary

No training-compute estimate is produced for Bel. The required inputs are not
publicly established: architecture, parameter count, active parameters, token
count, numerical precision, optimizer, hardware mix, utilization, run duration,
restarts, and post-training scope.

## What can be explained without laundering the rumor

1. **Parameters and training tokens are different units.** Leo's post says more
   than 10 trillion total parameters. Adit's shorter “10T+ pretrain” wording is
   ambiguous. Neither is evidence of a 10-trillion-token dataset.
2. **Model size is not a single public axis.** Dense parameters, mixture-of-
   experts total parameters, active parameters per token, context length, and
   training compute describe different things. GPT-4.5's public launch page
   does not provide the number needed for the claimed comparison.
3. **Pretraining completion is not launch readiness.** OpenAI's own GPT-4.5 page
   separates pretraining from SFT and RLHF. Its August 2026 update also shows
   that frontier RL and safety work can be paused while other work continues.
4. **Infrastructure raises possibility, not identity.** OpenAI says Abilene ran
   early training workloads. That proves useful training capacity existed. It
   supplies no name, checkpoint, parameter count, or lineage for those runs.
5. **An AGI threshold needs a test.** The Bel post provides no definition,
   capability boundary, evaluation, or decision procedure. The phrase cannot
   support a technical conclusion.

## Why no scale graphic is allowed

The viral star illustration visually treats Bel as much larger than Doug or
Astra, but it cites no values. A numeric Bel-versus-GPT-4.5 chart would repeat
the rumor as measurement. The package instead uses a deterministic verdict
matrix whose categories are auditable from the claim ledger.
