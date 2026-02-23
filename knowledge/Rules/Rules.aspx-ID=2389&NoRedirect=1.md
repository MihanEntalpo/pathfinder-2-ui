# Afflictions - Rules - Archives of Nethys: Pathfinder 2nd Edition Database

Source HTML: `docs/aonprd/Rules.aspx-ID=2389&NoRedirect=1.htm`

# [Rules Index](./Rules.aspx.md) | [GM Screen](../GMScreen/GMScreen.aspx.md) | [Player's Guide](../PlayersGuide/PlayersGuide.aspx.md)

---

Player Core

[Chapter 8: Playing the Game](./Rules.aspx-ID=2263.md)

[>

# [Afflictions](./Rules.aspx-ID=2389.md)

Source [Player Core pg. 430](../Source/Sources.aspx-ID=216.md)

Diseases and poisons are types of afflictions, as are curses and radiation. An affliction can infect a creature for a long time, progressing through different and often increasingly debilitating stages.

## Format

Whether appearing in a spell, as an item, or within a creature’s stat block, afflictions appear in the following format.

### Name and Traits

The affliction’s name is given first, followed by its traits in parentheses—including the trait for the type of affliction ([curse](../Trait/Traits.aspx-ID=566.md), [disease](../Trait/Traits.aspx-ID=578.md), [poison](../Trait/Traits.aspx-ID=669.md), and so forth). If the affliction needs to have a level specified, it follows the parentheses, followed by any unusual details, such as restrictions on removing the conditions imposed by an affliction. If no level is listed, the affliction matches the level of the creature, hazard, or item causing the affliction.

### Saving Throw

When you're first exposed to the affliction, you must attempt a saving throw against it. This first attempt to stave off the affliction is called the initial save. An affliction usually requires a Fortitude save, but the exact save and its DC are listed after the name and type of affliction. Spells that can cause an affliction typically use the caster's spell DC.

On a successful initial saving throw, you are unaffected by that exposure to the affliction. You don't need to attempt further saving throws against it unless you are exposed to the affliction again.

If you fail the initial saving throw, you advance to stage 1 of the affliction and are subjected to the listed effect. On a critical failure, after its onset period (if applicable), you advance to stage 2 of the affliction and are subjected to that effect instead.

### Onset

Some afflictions have onset times. For these afflictions, once you fail your initial save, you don’t gain the effects for the first stage of the affliction until the onset time has elapsed. If this entry is absent, you gain the effects for the first stage (or the second stage on a critical failure) immediately upon failing the initial saving throw.

### Maximum Duration

If an affliction lasts only a limited amount of time, it lists a maximum duration. Once this duration passes, the affliction ends. Otherwise, it lasts until you succeed at enough saves to recover, as described in Stages below.

### Stages

An affliction typically has multiple stages, each of which lists an effect followed by an interval in parentheses. When you reach a given stage of an affliction, you are subjected to the effects listed for that stage.

At the end of a stage's listed interval, you must attempt a new saving throw. On a success, you reduce the stage by 1; on a critical success, you reduce the stage by 2. You are then subjected to the effects of the new stage. If the affliction's stage is ever reduced below stage 1, the affliction ends and you don't need to attempt further saves unless you're exposed to the affliction again.

On a failure, the stage increases by 1; on a critical failure, the stage increases by 2. You are then subjected to the effects listed for the new stage. If a failure or critical failure would increase the stage beyond the highest listed stage, the affliction instead repeats the effects of the highest stage.

## Damage and Conditions

Any damage listed for a stage happens immediately when you reach that stage. Conditions affect you when you reach the stage and last for their normal duration. For instance, if you were [drained](../Condition/Conditions.aspx-ID=68.md) for an affliction with a maximum duration of 5 minutes, you remain drained after the affliction ends, as normal for the drained condition. A condition that automatically changes its value or ends under certain circumstances, like [frightened](../Condition/Conditions.aspx-ID=76.md), still does so. Any condition that doesn’t have a default duration, such as [clumsy](../Condition/Conditions.aspx-ID=61.md) or [paralyzed](../Condition/Conditions.aspx-ID=85.md), lasts as long as you’re at that stage unless noted otherwise, as do any penalties or any other effect of the stage that doesn’t list a duration.

## Multiple Exposures

Multiple exposures to the same curse or disease currently affecting you have no effect. For a poison, however, failing the initial saving throw against a new exposure increases the stage by 1 (or by 2 if you critically fail) without affecting the maximum duration. This is true even if you’re within the poison’s onset period, though it doesn’t change the onset length. If the poison does not have an onset time or it’s already elapsed, you are immediately subject to the effects of the new stage.

## Virulent Afflictions

Afflictions with the [virulent](../Trait/Traits.aspx-ID=726.md) trait are harder to remove. You must succeed at two consecutive saves to reduce a virulent affliction’s stage by 1. A critical success reduces a virulent affliction’s stage by only 1 instead of by 2.

## Removing Afflictions

Apart from waiting them out, afflictions can be removed through certain uses of the skills and spells. The [Treat Disease](../Action/Actions.aspx-ID=2397.md) and [Treat Poison](../Action/Actions.aspx-ID=2398.md) uses of [Medicine](../Skill/Skills.aspx-ID=42.md) are commonly used to treat those afflictions.

The [cleanse affliction](../Spell/Spells.aspx-ID=1467.md) spell is also available to most spellcasters. Spells that counteract conditions at the source, such as [sound body](../Spell/Spells.aspx-ID=1679.md), can also be effective against diseases and poisons that cause those conditions.

Curses are trickier, requiring solutions that specifically mention them, such as a 4th-rank cleanse affliction or the [Break Curse](../Feat/Feats.aspx-ID=5128.md) skill feat.

## Counteracting

Some effects try to counteract spells, afflictions, conditions, or other effects. Counteract checks compare the power of two forces and determine which defeats the other. Successfully counteracting an effect disrupts it, preventing it from having any effect, unless noted otherwise.

When attempting a counteract check, add the relevant skill modifier or other appropriate modifier to your check against the target's DC. If you're counteracting an [affliction](./Rules.aspx-ID=2389.md), the DC is in the affliction's stat block. If it's a spell, use the caster's DC. The GM can also calculate a DC based on the target effect's level. For spells, the counteract check modifier is your spellcasting attribute modifier plus your spellcasting proficiency bonus, plus any bonuses and penalties that specifically apply to counteract checks.

What you can counteract depends on the check result and the target's counteract rank. If an effect is a spell, its rank is the counteract rank. Otherwise, halve its level and round up to determine its counteract rank (minimum counteract rank 0). If an effect's level is unclear and it came from a creature, halve and round up the creature's level.

Critical Success Counteract the target if its counteract rank is no more than 3 higher than your effect's counteract rank.
Success Counteract the target if its counteract rank is no more than 1 higher than your effect's counteract rank.
Failure Counteract the target if its counteract rank is lower than your effect's counteract rank.
Critical Failure You fail to counteract the target.

## Counteract Table

This table provides a reference for what an effect can counteract based on its rank and the check result. The first number in each column is the counteract rank at which you can counteract an effect based on your degree of success. The numbers in parentheses are the typical level range corresponding to that rank.

## Counteract

| Counteract Rank
| Failure
| Success
| Critical Success

| 0
| —
| 1 (1 to 2)
| 3 (5 to 6)

| 1
| 0 (–1 to 0)
| 2 (3 to 4)
| 4 (7 to 8)

| 2
| 1 (1 to 2)
| 3 (5 to 6)
| 5 (9 to 10)

| 3
| 2 (3 to 4)
| 4 (7 to 8)
| 6 (11 to 12)

| 4
| 3 (5 to 6)
| 5 (9 to 10)
| 7 (13 to 14)

| 5
| 4 (7 to 8)
| 6 (11 to 12)
| 8 (15 to 16)

| 6
| 5 (9 to 10)
| 7 (13 to 14)
| 9 (17 to 18)

| 7
| 6 (11 to 12)
| 8 (15 to 16)
| 10 (19 to 20)

| 8
| 7 (13 to 14)
| 9 (17 to 18)
| 11 (21 to 22)

| 9
| 8 (15 to 16)
| 10 (19 to 20)
| 12 (23 to 24)

| 10
| 9 (17 to 18)
| 11 (21 to 22)
| 13 (25 to 26)

[>
