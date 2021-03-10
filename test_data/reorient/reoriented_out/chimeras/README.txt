If there are some fasta files in that directory here,
then the sequences in these files were considered as chimeric ones and removed from the reorianted data set.
Note that the sequences are recorded twice in the fasta files: in forward and reverse complementary strands.


Logic behind considering these seqs as chimeric ones:
PCR primer strings were specified in orientation they are used in a PCR; i.e.
forward primer in 5'-3' orientation and reverse primer in 3'-5' orientation.
[IF THAT WAS NOT THE CASE, THEN RUN THIS STEP AGAIN!]
Therefore if a forward primer string was found in a sequence,
but also a reverse primer sting was found in the same sequence,
the sequence consists of 5'-3' and 3'-5' oriented fragments.
It is highly likely that this sequence is a chimeric one, and therefore removed.
Usually only very few such 'multi-primer' chimeric sequences are found in the amplicon data sets.
