## Grouping

### Goals
1. Make sure everyone does one thing at a time (across all possible activities - rooms/stages).
2. Sort competitors by their official results.
3. If there are multiple organizers/delegates/dataentries,
try to make one person of the given role available all the time
(i.e. don't assign two people of the same role to overlapping activities).

### Algorithm
Given rounds to assign, sort them by the number of groups, so that rounds with
few possible timeframes are assigned first. For each round:
1. Create temporary group objects of the form `{ id, activity, size, competitors }`,
where `id` reflects activity.id (just for convenience), `activity` is the group activity,
`size` is the computed number of competitors in that group and `competitors` is an array of *WCIF Person*.
These objects are referred to as *groups* from now on.
2. Sort groups by their number (which also implies chronology).
3. Iterate over sorted competitors and for each of them:
    1. Find all the groups during which he's the most available (*most available groups*)
    (usually these are just the groups during which he doesn't have any other assignments,
    but if there are no such groups then we want to pick the ones that overlap the less with other assignments) **[Goal 1]**
    2. If he's an organizer/delegate/dataentry, from *most available groups* select all the groups
    during which he doesn't overlap every other organizer/delegate/dataentry (*preferred groups*). **[Goal 3]**
    3. Consider *preferred groups* if any and *most available groups* otherwise (*potential groups*).
    4. Look up the first *potential group* that is not full. If there is one, assign the competitor to it. We're done.
    5. Given all *potential groups* are full, assign the competitor to the last one (so it becomes over-populated). Then:
        1. Try moving someone from the over-populated group to one of further groups. If successful, we're done.
        2. Try moving someone from the over-populated group to one of previous groups
        and someone from that previous group to one of further groups (just like in *1.*). If successful, we're done.
        3. Otherwise leave the group over-populated (highly unlikely).
4. Update WCIF and proceed with the next round. This way the new assignments
are taken into account during the further process.
