.. image:: C:/Users/stena/Dropbox/PIPELINE/PipeCraft2_manual/PipeCraft2_icon_v2.png
  :width: 80
  :alt: logo

==========
User guide
==========

The interface
==============

``The main interface image with explanations``

Full pipeline workflows
=======================

ASVs (DADA2) workflow panel
----------------------------
This automated workflow is based on DADA2 tutorial: https://benjjneb.github.io/dada2/tutorial.html 
 | Note that ``demultiplexing``, ``reorient`` and ``remove primers`` steps are optional and do not represent parts from DADA2 tutorial. Nevertheless, it is advisable to :ref:`reorient <reorinet>` your reads (to 5'-3') and :ref:`remove primers <remove_primers>` before proceeding with ASV generation with DADA2.




**Default options:**

================================================= =========================
Analyses step                                     Setting
================================================= =========================
:ref:`DEMULTIPLEX <demux>` (optional)              --
:ref:`REORIENT <reorinet>` (optional)              --
:ref:`REMOVE PRIMERS <remove_primers>` (optional)  --
:ref:`FILTER AND TRIM <qual_filt>`                 | ``maxEE`` = 1
                                                   | ``maxN`` = 0
                                                   | ``minLen`` = 32
                                                   | ``truncQ`` = 2
                                                   | ``truncLen`` = 0
                                                   | ``maxLen`` = 600
                                                   | ``minQ`` = 2
:ref:`MERGE PAIRED-END READS <merge_pairs>`        | ``minOverlap`` = 12
                                                   | ``maxMismatch`` = 0
                                                   | ``returnRejects`` = FALSE
:ref:`REMOVE CHIMERAS <chimeras>`                  | ``method`` = consensus
:ref:`ASSGIN TAXONOMY <taxonomy>`                  | ``minBoot`` = 50
                                                   | ``tryRC`` = FALSE
                                                   | ``refFasta`` = silva138.1
================================================= =========================


OTUs (vsearch) workflow panel
------------------------------
xxx


.. _panels:

ANALYSES PANELS
===============

.. _demux:

DEMULTIPLEX
===========
If data is **multiplexed, the first step would be demultiplexing**. 
This is done based on the user specified :ref:`indexes file <indexes>`, which includes molecular identifier sequences (so called indexes/tags/barcodes) per sample. 
Note that reverse complementary matches will also be searched. 
**Output** will be fastq/fasta files per sample. Indexes will be **truncated** from the sequences. 



.. _indexes:

Indexes file example (fasta formatted)
--------------------------------------
.. note::
  Only **IUPAC codes** are allowed.

1. Demultiplexing using single indexes:
 | >sample1
 | AGCTGCACCTAA
 | >sample2
 | AGCTGTCAAGCT
 | >sample3
 | AGCTTCGACAGT
 | >sample4
 | AGGCTCCATGTA
 | >sample5
 | AGGCTTACGTGT
 | >sample6
 | AGGTACGCAATT

2. Demultiplexing using dual indexes (IMPORTANT! reverse indexes will be automatically oriented to 5'-3' (like fwd indexes); so you can simply copy-paste the indexes from your lab protocol.)
 | >sample1
 | AGCTGCACCTAA...AGCTGCACCTAA
 | >sample2
 | AGCTGTCAAGCT...AGCTGTCAAGCT
 | >sample3
 | AGCTTCGACAGT...AGCTTCGACAGT
 | >sample4
 | AGGCTCCATGTA...AGGCTCCATGTA
 | >sample5
 | AGGCTTACGTGT...AGGCTTACGTGT
 | >sample6
 | AGGTACGCAATT...AGGTACGCAATT

.. note::
 Anchored indexes (https://cutadapt.readthedocs.io/en/stable/guide.html#anchored-5adapters) with ^ symbol are not supported in PipeCraft demultiplex GUI panel. 

  DO NOT USE, e.g. 
 | >sample1
 | ^AGCTGCACCTAA
 | 
 | >sample1
 | ^AGCTGCACCTAA...AGCTGCACCTAA





.. _reorinet:

REORIENT
========
xxx


.. _remove_primers:

TRIM ADAPTERS/PRIMERS
=====================
xxx


.. _qual_filt:

QUALITY FILTER
==============
xxx


.. _merge_pairs:

ASSEMBLE PAIRED-END reads 
=========================
xxx


.. _chimeras:

REMOVE CHIMERAS
===============
xxx


.. _taxonomy:

ASSIGN TAXONOMY
===============
xxx



.. _expert_mode:

Expert-mode (via command line)
==============================
xxx

