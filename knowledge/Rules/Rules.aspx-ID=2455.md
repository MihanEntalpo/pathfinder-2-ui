# Conditions Appendix - Rules - Archives of Nethys: Pathfinder 2nd Edition Database

Source HTML: `docs/aonprd/Rules.aspx-ID=2455.htm`

# [Rules Index](./Rules.aspx.md) | [GM Screen](../GMScreen/GMScreen.aspx.md) | [Player's Guide](../PlayersGuide/PlayersGuide.aspx.md)

---

[Source [Player Core pg. 442](../Source/Sources.aspx-ID=216.md)

While adventuring, characters (and sometimes their belongings) are affected by abilities and effects that apply conditions. For example, a spell or magic item might turn you [invisible](../Condition/Conditions.aspx-ID=83.md) or cause you to be gripped by [fear](../Condition/Conditions.aspx-ID=76.md). Conditions change your state of being in some way, and they represent everything from the attitude other creatures have toward you and how they interact with you to what happens when a creature drains your blood or life essence.

Conditions are persistent. Whenever you're affected by a condition, its effects last until the condition's stated duration ends, the condition is removed, or terms dictated in the condition itself cause it to end.

See the [Conditions](../Condition/Conditions.aspx.md) page for a full list of conditions.

## Groups of Conditions

Some conditions exist relative to one another or share a similar theme. It can be useful to look at these conditions together to understand how they interact.

Detection: [Observed](../Condition/Conditions.aspx-ID=84.md), [hidden](../Condition/Conditions.aspx-ID=79.md), [undetected](../Condition/Conditions.aspx-ID=96.md), [unnoticed](../Condition/Conditions.aspx-ID=98.md)
Senses: [Blinded](../Condition/Conditions.aspx-ID=59.md), [concealed](../Condition/Conditions.aspx-ID=62.md), [dazzled](../Condition/Conditions.aspx-ID=65.md), [deafened](../Condition/Conditions.aspx-ID=66.md), [invisible](../Condition/Conditions.aspx-ID=83.md)
Death and Dying: [Doomed](../Condition/Conditions.aspx-ID=67.md), [dying](../Condition/Conditions.aspx-ID=69.md), [unconscious](../Condition/Conditions.aspx-ID=95.md), [wounded](../Condition/Conditions.aspx-ID=99.md)
Attitudes: [Hostile](../Condition/Conditions.aspx-ID=80.md), [unfriendly](../Condition/Conditions.aspx-ID=97.md), [indifferent](../Condition/Conditions.aspx-ID=82.md), [friendly](../Condition/Conditions.aspx-ID=75.md), [helpful](../Condition/Conditions.aspx-ID=78.md)
Lowered Abilities: [Clumsy](../Condition/Conditions.aspx-ID=61.md), [drained](../Condition/Conditions.aspx-ID=68.md), [enfeebled](../Condition/Conditions.aspx-ID=71.md), [stupefied](../Condition/Conditions.aspx-ID=94.md)

## Death and Dying Rules

The [doomed](../Condition/Conditions.aspx-ID=67.md), [dying](../Condition/Conditions.aspx-ID=69.md), [unconscious](../Condition/Conditions.aspx-ID=95.md), and [wounded](../Condition/Conditions.aspx-ID=99.md) conditions all relate to the process of coming closer to death. The full rules are [here](./Rules.aspx-ID=2319.md). The most significant information not contained in the conditions themselves is this: When you're reduced to 0 Hit Points, you're knocked out with the following effects:

- You immediately move your initiative position to directly before the creature or effect that reduced you to 0 Hit Points.
- You gain the dying 1 condition. If the effect that knocked you out was a critical success from the attacker or the result of your critical failure, you gain the dying 2 condition instead. If you have the wounded condition, increase these values by your wounded value. If the damage came from a [nonlethal](../Trait/Traits.aspx-ID=661.md) attack or effect, you don't gain the dying condition—you are instead unconscious with 0 Hit Points.

## Gaining and Losing Actions

[Quickened](../Condition/Conditions.aspx-ID=89.md), [slowed](../Condition/Conditions.aspx-ID=92.md), and [stunned](../Condition/Conditions.aspx-ID=93.md) are the primary ways you can gain or lose actions. The rules for how this works appear here.. All these conditions alter how many actions you regain at the start of your turn. Gaining quickened or slowed on your turn doesn't adjust your actions that turn. If you get stunned on your turn, first complete any action or activity you're in the middle of. If the stunned condition has a value, lose remaining actions to reduce your stunned value rather than waiting until your next turn.

Some conditions prevent you from taking a certain subset of actions, typically reactions. Other conditions simply say you can't act. When you can't act, you're unable to take any actions at all. Unlike slowed or stunned, these don't change the number of actions you regain; they just prevent you from using them. That means if you are somehow cured of paralysis on your turn, you can act immediately.

## Redundant Conditions

You can have a given condition only once at a time. If an effect would impose a condition you already have, you now have that condition for the longer of the two durations. The shorter-duration condition effectively ends, though other conditions caused by the original, shorter-duration effect might continue.

For example, let's say you have been hit by a monster that crushes your arm; your wound causes you to be [enfeebled](../Condition/Conditions.aspx-ID=71.md) 2 and [off-guard](../Condition/Conditions.aspx-ID=58.md) until the end of the monster's next turn. Before the end of that creature's next turn, a trap poisons you, making you enfeebled 2 for 1 minute. In this case, the enfeebled 2 that lasts for 1 minute replaces the enfeebled 2 from the monster, so you would be enfeebled 2 for the longer duration. You would remain off-guard, since nothing replaced that condition, and it still lasts only until the end of the monster's next turn.

Any ability that removes a condition removes it entirely, no matter what its condition value is or how many times you've been affected by it. In the example above, a spell that removes the enfeebled condition from you would remove it entirely—the spell wouldn't need to remove it twice.

## Redundant Conditions With Values

Conditions with different values are considered different conditions. If you're affected by a condition with a value multiple times, you apply only the highest value, although you might have to track both durations if one has a lower value but lasts longer. For example, if you had a [slowed](../Condition/Conditions.aspx-ID=92.md) 2 condition that lasts 1 round and a slowed 1 condition that lasts for 6 rounds, you'd be slowed 2 for the first round, and then you'd change to slowed 1 for the remaining 5 rounds of the second effect's duration. If something reduces the condition value, it reduces it for all conditions of that name affecting you. For instance, in this example above, if something reduced your slowed value by 1, it would reduce the first condition from the example to slowed 1 and reduce the second to slowed 0, removing it.

## Condition Values

Some conditions have a number after the condition, called a condition value. This value conveys the severity of a condition, and such conditions often give you a bonus or penalty equal to their value. These values can often be reduced by skills, spells, or simply waiting. If a condition value is ever reduced to 0, the condition ends.

## Overriding Conditions

Some conditions override others. This is always specified in the entry for the overriding condition. When this happens, all effects of the overridden condition are suppressed until the overriding condition ends. The overridden condition’s duration continues to elapse, and it might run out while suppressed.

[<< Chapter 8: Playing the Game](./Rules.aspx-ID=2263.md)
