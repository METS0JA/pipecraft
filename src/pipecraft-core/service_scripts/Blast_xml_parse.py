#!/usr/bin/python

from sys import argv
import re

script, filename1 = argv
from operator import itemgetter
import math
from decimal import Decimal
 
blast_hits=''

with open ('10hits.txt', 'w') as outputfile:                
    from Bio.Blast import NCBIXML
    File=open(filename1,'r')
    blast_records = NCBIXML.parse(File)
    for blast_record in blast_records:     
        i = 0
   
        if blast_record.alignments:
            blast_hits = blast_hits + str(blast_record.query)
            while i<10:
                try:
                    #calculate id percentage with 2 decimal places
                    identities = blast_record.alignments[i].hsps[0].identities
                    alignments = blast_record.alignments[i].hsps[0].align_length
                    x = float(identities*100)
                    y = float(alignments)
                    percentage = round(x/y,2)

                    #calculate query coverage percentage (q_end - q_start)/q_len*100
                    coverage = \
                    (blast_record.alignments[i].hsps[0].query_end - \
                    blast_record.alignments[i].hsps[0].query_start + 1) \
                    / blast_record.query_length*100
                    coverage = round(coverage,2)


                    #output blast values
                    blast_hits = blast_hits + \
                    '\t' + str(blast_record.alignments[i].title)+'\t'
                    
                    #score
                    #e-value
                    #query seq len
                    #start position of match in the query seq
                    #end position of match in the query seq
                    #target seq length in the database
                    #start position of match in the target seq
                    #end position of match in the target seq
                    #alignment length
                    #number of identical matches
                    #number of gaps in the alignment
                    #coverage %
                    #id %
                    blast_values = \
                    str(i) + '\t' + \
                    str(blast_record.alignments[i].title) + \
                    '+' + str(blast_record.alignments[i].hsps[0].score) + \
                    '+' + str(blast_record.alignments[i].hsps[0].expect) + \
                    '+' + str(blast_record.query_length) + \
                    '+' + str(blast_record.alignments[i].hsps[0].query_start) + \
                    '+' + str(blast_record.alignments[i].hsps[0].query_end) + \
                    '+' + str(blast_record.alignments[i].length) + \
                    '+' + str(blast_record.alignments[i].hsps[0].sbjct_start) + \
                    '+' + str(blast_record.alignments[i].hsps[0].sbjct_end) + \
                    '+' + str(blast_record.alignments[i].hsps[0].align_length) + \
                    '+' + str(blast_record.alignments[i].hsps[0].identities) + \
                    '+' + str(blast_record.alignments[i].hsps[0].gaps) + \
                    '+' + str(coverage) + '%' \
                    '+' + str(percentage) + '%'

                    blast_hits = blast_hits + blast_values
                except IndexError:
                    blast_hits = blast_hits + '\t'+'no_blast_hit' + '\t'
                i+=1
        else:
            blast_hits = blast_hits + str(blast_record.query) + '\t' + '\t' + '\t' + 'no_blast_hit'

        blast_hits=blast_hits + "\n"
       # blast_hits = blast_hits.replace("gnl|BL_ORD_ID|", "")
        blast_hits = re.sub(r'gnl\|BL_ORD_ID\|[0-9]*\s', '', blast_hits)
    outputfile.write(blast_hits)
outputfile.close()