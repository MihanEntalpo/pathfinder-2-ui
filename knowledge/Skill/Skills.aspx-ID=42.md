# Medicine - Skills - Archives of Nethys: Pathfinder 2nd Edition Database

Source HTML: `docs/aonprd/Skills.aspx-ID=42.htm`

# [General Skills](./Skills.aspx-General=true.md)[Acrobatics](./Skills.aspx-ID=34.md) | [Arcana](./Skills.aspx-ID=35.md) | [Athletics](./Skills.aspx-ID=36.md) | [Crafting](./Skills.aspx-ID=37.md) | [Deception](./Skills.aspx-ID=38.md) | [Diplomacy](./Skills.aspx-ID=39.md) | [Intimidation](./Skills.aspx-ID=40.md) | [Lore](./Skills.aspx-ID=41.md) | [Medicine](./Skills.aspx-ID=42.md) | [Nature](./Skills.aspx-ID=43.md) | [Occultism](./Skills.aspx-ID=44.md) | [Performance](./Skills.aspx-ID=45.md) | [Religion](./Skills.aspx-ID=46.md) | [Society](./Skills.aspx-ID=47.md) | [Stealth](./Skills.aspx-ID=48.md) | [Survival](./Skills.aspx-ID=49.md) | [Thievery](./Skills.aspx-ID=50.md)

##

---

There is a Legacy version here.

# [Medicine (Wis)](./Skills.aspx-ID=42.md)

Source [Player Core pg. 241](../Source/Sources.aspx-ID=216.md)
You can patch up wounds and help people recover from diseases and poisons. Treat Wounds is especially useful, allowing your adventuring party to heal up between fights. It can be made more efficient with skill feats like Continual Recovery and Ward Medic.

- [Recall Knowledge](./Skills.aspx-ID=24&General=true.md) about diseases, injuries, poisons, and other ailments. You can use this to perform forensic examinations if you spend 10 minutes (or more, as determined by the GM) checking for evidence such as wound patterns. This is most useful when determining how a body was injured or killed.

Item Bonuses

### Related Feats

To see a list of Feats related to Medicine, [click here](../Feat/Feats.aspx-Traits=144&Skill=Medicine.md).

# Medicine Untrained Actions

## [Administer First Aid](../Action/Actions.aspx-ID=2396.md) [two-actions]

[Manipulate](../Trait/Traits.aspx-ID=645&Redirected=1.md)
Source [Player Core pg. 241](../Source/Sources.aspx-ID=216.md)
Requirements You're wearing or holding a [healer's toolkit](../Equipment/Equipment.aspx-ID=2727.md).

---

You perform first aid on an adjacent creature that is dying or [bleeding](../Condition/Conditions.aspx-ID=86&Redirected=1.md). If a creature is both dying and bleeding, choose which ailment you're trying to treat before you roll. You can Administer First Aid again to attempt to remedy the other effect.

- Stabilize Attempt a Medicine check on a creature that has 0 Hit Points and the dying condition. The DC is equal to 5 + that creature's recovery roll DC (typically 15 + its dying value).
- Stop Bleeding Attempt a Medicine check on a creature that is taking persistent bleed damage. The DC is usually the DC of the effect that caused the bleed.

Success If you're trying to stabilize, the target loses the dying condition (but remains unconscious). If you're trying to stop bleeding, the target benefits from an [assisted recovery](../Condition/Conditions.aspx-ID=86&Redirected=1.md) with the lowered DC for particularly appropriate help.
Critical Failure If you were trying to stabilize, the target's dying value increases by 1. If you were trying to stop bleeding, the target immediately takes an amount of damage equal to its persistent bleed damage.

# Medicine Trained Actions

## [Treat Disease](../Action/Actions.aspx-ID=2397.md)

[Downtime](../Trait/Traits.aspx-ID=580.md) [Manipulate](../Trait/Traits.aspx-ID=645&Redirected=1.md)
Source [Player Core pg. 242](../Source/Sources.aspx-ID=216.md)
Requirements You're wearing or holding a [healer's toolkit](../Equipment/Equipment.aspx-ID=2727.md).

---

You spend at least 8 hours caring for a diseased creature. Attempt a Medicine check against the [disease's](../Trait/Traits.aspx-ID=578.md) DC. After you attempt to Treat a Disease for a creature, you can't try again until after that creature's next save against the disease.

Critical Success You grant the creature a +4 circumstance bonus to its next saving throw against the disease.
Success You grant the creature a +2 circumstance bonus to its next saving throw against the disease.
Critical Failure Your efforts cause the creature to take a –2 circumstance penalty to its next save against the disease.

## [Treat Poison](../Action/Actions.aspx-ID=2398.md) [one-action]

[Manipulate](../Trait/Traits.aspx-ID=645&Redirected=1.md)
Source [Player Core pg. 242](../Source/Sources.aspx-ID=216.md)
Requirements You're wearing or holding a [healer's toolkit](../Equipment/Equipment.aspx-ID=2727.md).

---

You treat a patient to prevent the spread of poison. Attempt a Medicine check against the poison's DC. After you attempt to Treat a Poison for a creature, you can't try again until after the next time that creature attempts a save against the poison.

Critical Success You grant the creature a +4 circumstance bonus to its next saving throw against the poison.
Success You grant the creature a +2 circumstance bonus to its next saving throw against the poison.
Critical Failure Your efforts cause the creature to take a –2 circumstance penalty to its next save against the poison.

## [Treat Wounds](../Action/Actions.aspx-ID=2399.md)

[Exploration](../Trait/Traits.aspx-ID=595.md) Healing [Manipulate](../Trait/Traits.aspx-ID=645&Redirected=1.md)
Source [Player Core pg. 242](../Source/Sources.aspx-ID=216.md)
Requirements You're wearing or holding a [healer's toolkit](../Equipment/Equipment.aspx-ID=2727.md).

---

You spend 10 minutes treating one injured living creature (targeting yourself, if you so choose). The target is then temporarily immune to Treat Wounds actions for 1 hour, but this interval overlaps with the time you spent treating (so a patient can be treated once per hour, not once per 70 minutes).

The Medicine check DC is usually 15, though the GM might adjust it based on the circumstances, such as treating a patient outside in a storm, or treating magically cursed wounds. If you're an expert in Medicine, you can instead attempt a DC 20 check to increase the Hit Points regained by 10; if you're a master of Medicine, you can instead attempt a DC 30 check to increase the Hit Points regained by 30; and if you're legendary, you can instead attempt a DC 40 check to increase the Hit Points regained by 50. The damage dealt on a critical failure remains the same.

If you succeed at your check, you can continue treating the target to grant additional healing. If you treat it for a total of 1 hour, double the Hit Points it regains from Treat Wounds.

The result of your Medicine check determines how many Hit Points the target regains.

## Treat Wounds

| Proficiency
| DC
| Success Healing
| Critical Healing

| Trained
| 15
| 2d8
| 4d8

| Expert*
| 20
| 2d8+10
| 4d8+10

| Master*
| 30
| 2d8+30
| 4d8+30

| Legendary*
| 40
| 2d8+50
| 4d8+50

* Rolling against a higher DC is optional.

Critical Success The target regains 4d8 Hit Points and loses the wounded condition.
Success The target regains 2d8 Hit Points, and loses the wounded condition.
Critical Failure The target takes 1d8 damage.
