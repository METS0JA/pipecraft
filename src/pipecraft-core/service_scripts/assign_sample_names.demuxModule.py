#!/usr/bin/python

#Renaming files when using combinatorial dual indexes for demultiplexing, using cutadapt
print(" python module runs")

from Bio import SeqIO
from sys import argv
import os

#script.py $indexes_file
script, indexes_file, fwd, rev, files = argv

#read demultiplexed file names
demux_files = open(files, 'r')
for line in demux_files:
	print(line)
	el = line.strip()
	el = el.split("-")

	#el[0] forward index name
	#el[1] reverse index name

	#open fwd index file and seach index seq for matching index name
	with open(fwd) as indexes_fwd:
		for record in SeqIO.parse(indexes_fwd, "fasta"):
			if el[0] in record.id:

				#open rev index file and seach index seq for matching index name
				with open(rev) as indexes_rev:
					for record2 in SeqIO.parse(indexes_rev, "fasta"):
						if el[1] in record2.id:

							#open paired-indexes file
							with open(indexes_file) as indexes_all:
								for record3 in SeqIO.parse(indexes_all, "fasta"):
									if record.seq in record3.seq:
										if record2.seq in record3.seq:
											print(el[0] + " and " + el[1] + " combo ->  " + record3.id + ", with indexes " + record3.seq)
											sampl_nameR1 = "demultiplex_out/" + str(record3.id) + ".R1.fq"
											sampl_nameR2 = "demultiplex_out/" + str(record3.id) + ".R2.fq"

											line_R1 = "/input/demultiplex_out/" + line.strip() + ".R1.fq"
											line_R2 = "/input/demultiplex_out/" + line.strip() + ".R2.fq"
											print(line_R1)

											#rename files
											if os.path.isfile(line_R1):
												os.rename(line_R1, sampl_nameR1)
											if os.path.isfile(line_R2):
												os.rename(line_R2, sampl_nameR2)
