import Vue from "vue";
import Vuex from "vuex";
import router from "../router/index.js";
var _ = require("lodash");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dockerStatus: "",
    runInfo: { active: false, type: null, step: null, nrOfSteps: null },
    loader: {
      active: false,
      index: 5,
    },
    workingDir: "/input",
    inputDir: "",
    data: {
      readType: "",
      dataFormat: "",
      fileFormat: "",
    },
    env_variables: ["FOO=bar", "BAZ=quux"],
    selectedSteps: [],
    steps: [
      {
        stepName: "demultiplex",
        disabled: "demultiplexed",
        services: [
          {
            scriptName: "demux_paired_end_data.sh",
            imageName: "pipecraft/demux:0.1",
            serviceName: "demultiplex",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "index_file",
                value: "undefined",
                btnName: "select fasta",
                disabled: "never",
                tooltip:
                  "Select your fasta formatted file for demultiplexing where fasta headers = sample names and sequences = sample specific index or index combination",
                type: "file",
              },
              {
                name: "index_mismatch",
                value: 1,
                disabled: "never",
                tooltip:
                  "Default = 0. Allowed mismatches during the index search",
                type: "numeric",
              },
              {
                name: "overlap",
                value: 12,
                disabled: "never",
                tooltip:
                  "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file.",
                type: "numeric",
              },
              {
                name: "cores",
                value: 2,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
              },
              {
                name: "min_seq_length",
                value: 10,
                disabled: "never",
                tooltip: "minimum length of the output sequence",
                type: "numeric",
              },
              {
                name: "no_indels",
                value: true,
                disabled: "never",
                tooltip: "do not allow insertions or deletions",
                type: "bool",
              },
            ],
          },
          {
            scriptName: "exampleScript.sh",
            imageName: "exmaple:image",
            serviceName: "example inputs",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "param1",
                value: 2,
                disabled: "never",
                tooltip: "numeric",
                type: "numeric",
              },
              {
                name: "param2",
                value: true,
                disabled: "never",
                tooltip: "boolean",
                type: "bool",
              },
              {
                name: "select 1",
                items: ["16S", "ITS", "18S"],
                value: "16S",
                disabled: "never",
                tooltip: "selection",
                type: "select",
              },
              {
                name: "file 1",
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip: "file select",
                type: "file",
              },
              {
                name: "file 2",
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip: "boolean file select",
                active: false,
                type: "boolfile",
              },
              {
                name: "select 2",
                items: ["16S", "ITS", "18S"],
                disabled: "never",
                tooltip: "boolean select",
                value: "undefined",
                active: true,
                type: "boolselect",
              },
              {
                name: "chips",
                value: ["ACCTTGG", "GCGTAAA", "YNAAGGCCTT"],
                disabled: "never",
                tooltip: "IUPAC primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "slide",
                value: 0,
                disabled: "never",
                tooltip: "slide 4 life",
                max: 1,
                min: 0,
                step: 0.01,
                type: "slide",
              },
              {
                name: "combobox",
                items: ["nii", "palju", "asju", "mida", "valida"],
                value: [],
                disabled: "never",
                tooltip: "combobreaker",
                type: "combobox",
              },
            ],
          },
        ],
      },
      {
        stepName: "reorient",
        disabled: "never",
        services: [
          {
            scriptName: "reorient_paired_end_reads.sh",
            imageName: "pipecraft/reorient:1",
            serviceName: "reorient",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "mismatches",
                value: 2,
                disabled: "never",
                tooltip:
                  "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
                type: "numeric",
              },
              // paired-end tags not needed, because in reorienting PipeCraft needes 'R1' and 'R2' stings! Gives ERROR if 'R1' not found.
              //              {
              //                name: "paired_end_tags",
              //                value: ["R1", "R2"],
              //                disabled: "single_end",
              //                tooltip: "Define a tag for fwd and rev reads",
              //                type: "chip",
              //                iupac: false,
              //                rules: [(v) => v.length <= 2 || "TOO MANY TAGS"],
              //              },
              {
                name: "forward_primers",
                value: [],
                disabled: "never",
                tooltip: "manually define up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
                disabled: "never",
                tooltip: "manually define up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
            ],
          },
        ],
      },
      {
        stepName: "trim adapters|primers",
        disabled: "never",
        services: [
          {
            scriptName: "cut_primers_paired_end_reads.sh",
            imageName: "pipecraft/demux:0.1",
            serviceName: "cutadapt",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "forward_primers",
                value: [],
                disabled: "never",
                tooltip: "Add up to 13 PCR primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
                disabled: "never",
                tooltip: "Add up to 13 PCR primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "mismatches",
                value: 2,
                disabled: "never",
                tooltip:
                  "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
                type: "numeric",
              },
              {
                name: "min_overlap",
                value: 15,
                disabled: "never",
                tooltip:
                  "the number of minimum overlap bases with the primer sequence.",
                type: "numeric",
              },
              {
                name: "seqs_to_keep",
                items: ["keep_all", "keep_only_linked"],
                value: "keep_all",
                disabled: "never",
                tooltip:
                  "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
                type: "select",
              },
              {
                name: "cores",
                value: 1,
                disabled: "never",
                tooltip:
                  "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
                type: "numeric",
              },
              {
                name: "min_seq_length",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the output sequence.",
                type: "numeric",
              },
              {
                name: "overlap",
                value: 16,
                disabled: "never",
                tooltip:
                  "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified error range).",
                type: "numeric",
              },
              {
                name: "no_indels",
                value: true,
                disabled: "never",
                tooltip:
                  "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
                type: "bool",
              },
              {
                name: "discard_untrimmed",
                value: true,
                disabled: "never",
                tooltip:
                  "Discard sequences where specified primers were not found.",
                type: "bool",
              },
            ],
          },
          {
            scriptName: "trimmomatic-cut.sh",
            imageName: "pipecraft/trimmomatic:0.39",
            serviceName: "trimmomatic",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "mothur-cut.sh",
            imageName: "pipecraft/mothur:1.43",
            serviceName: "mothur",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
        ],
      },
      {
        stepName: "quality filter",
        disabled: "never",
        services: [
          {
            scriptName: "vsearch-quality.sh",
            imageName: "pipecraft/vsearch:2.18.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "fastq_maxlen",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of bases",
                type: "numeric",
              },
              {
                name: "fastq_truncqual",
                value: 0,
                disabled: "never",
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
                type: "numeric",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
                type: "numeric",
              },
              {
                name: "fastq_qmin",
                value: 0,
                disabled: "never",
                tooltip:
                  "Specify the minimum quality score accepted for FASTQ files",
                type: "numeric",
              },
            ],
            Inputs: [
              {
                name: "fastq_maxee",
                value: 1,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of expected error",
                type: "numeric",
              },
              {
                name: "fastq_maxns",
                value: 0,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "fastq_minlen",
                value: 1,
                disabled: "never",
                tooltip:
                  "Discard sequences with less than the specified number of bases",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "mothur-quality.sh",
            imageName: "pipecraft/mothur:1.43",
            serviceName: "mothur",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "qwindowaverage",
                value: 30,
                disabled: "never",
                tooltip:
                  "Set the minimum average quality score allowed over a window",
                type: "numeric",
              },
              {
                name: "qwindowsize",
                value: 32,
                disabled: "never",
                tooltip: "Set the number of bases in a window",
                type: "numeric",
              },
              {
                name: "maxambig",
                value: 0,
                disabled: "never",
                tooltip: "Set the number of allowed ambiguous base calls",
                type: "numeric",
              },
              {
                name: "qthreshold",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with a basecall below set quality value",
                type: "numeric",
              },
              {
                name: "minlength",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with less than the specified number of bases",
                type: "numeric",
              },
              {
                name: "maxlength",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of bases",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "dada2-quality.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "maxEE",
                value: 1,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of expected errors",
                type: "numeric",
              },
              {
                name: "maxN",
                value: 0,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "minLen",
                value: 20,
                disabled: "never",
                tooltip:
                  "Remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
                type: "numeric",
              },
              {
                name: "truncQ",
                value: null,
                disabled: "never",
                tooltip:
                  "Truncate reads at the first instance of a quality score less than or equal to truncQ",
                type: "numeric",
              },
              {
                name: "truncLen",
                value: 0,
                disabled: "never",
                tooltip:
                  "Truncate reads after truncLen bases. Reads shorter than this are discarded",
                type: "numeric",
              },
              {
                name: "maxLen",
                value: null,
                disabled: "never",
                tooltip:
                  "Remove reads with length greater than maxLen. maxLen is enforced on the raw reads",
                type: "numeric",
              },
              {
                name: "minQ",
                value: 0,
                disabled: "never",
                tooltip:
                  "After truncation, reads contain a quality score below minQ will be discarded",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "usearch-quality.sh",
            imageName: "pipecraft/usearch",
            serviceName: "usearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "fastq_maxee",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of expected errors for all bases in the read (is used after any truncation options have been applied).",
                type: "numeric",
              },
              {
                name: "fastq_maxns",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "fastq_minlen",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with less than the specified number of bases",
                type: "numeric",
              },
              {
                name: "fastq_stripleft",
                value: null,
                disabled: "never",
                tooltip: "Delete the first N bases in the read",
                type: "numeric",
              },
              {
                name: "fastq_truncqual",
                value: null,
                disabled: "never",
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
                type: "numeric",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                disabled: "never",
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "quality_filtering_paired_end_trimmomatic.sh",
            imageName: "pipecraft/trimmomatic:0.39",
            serviceName: "trimmomatic",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "window_size",
                value: 5,
                disabled: "never",
                tooltip:
                  "the number of bases to average base qualities. Starts scanning at the 5'-end of a sequence and trimms the read once the average required quality (required_qual) within the window size falls below the threshold.",
                type: "numeric",
              },
              {
                name: "required_quality",
                value: 27,
                disabled: "never",
                tooltip:
                  "the average quality required for selected window size",
                type: "numeric",
              },
              {
                name: "min_length",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the filtered sequence",
                type: "numeric",
              },
              {
                name: "leading_qual_threshold",
                value: null,
                disabled: "never",
                tooltip:
                  "quality score threshold to remove low quality bases from the beginning of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
                type: "numeric",
              },
              {
                name: "trailing_qual_threshold",
                value: null,
                disabled: "never",
                tooltip:
                  "quality score threshold to remove low quality bases from the end of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
                type: "numeric",
              },
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
              },
              {
                name: "phred",
                items: [33, 64],
                value: 33,
                disabled: "never",
                tooltip:
                  "phred quality scored encoding. Default is phred33. Use phred64 if working with data from older Illumina (Solexa) machines. ",
                type: "select",
              },
            ],
          },
        ],
      },
      {
        stepName: "assemble paired-end",
        disabled: "single_end",
        services: [
          {
            scriptName: "dada2-assemble.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "minOverlap",
                value: 12,
                disabled: "never",
                tooltip:
                  "The minimum length of the overlap required for mergingthe forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "maxMismatch",
                value: 0,
                disabled: "never",
                tooltip: "The maximum mismatches allowed in the overlap region",
                type: "numeric",
              },
              {
                name: "returnRejects",
                value: false,
                disabled: "never",
                tooltip:
                  "Return and retain, the pairs that that were rejected based on mismatches in the overlap region",
                type: "bool",
              },
            ],
          },
          {
            scriptName: "pandaseq-assemble.sh",
            imageName: "pipecraft/pandaseq:2.11",
            serviceName: "pandaseq",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "minoverlap -o",
                value: 1,
                disabled: "never",
                tooltip:
                  "Sets the minimum overlap between forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "minlen -l",
                value: 1,
                disabled: "never",
                tooltip:
                  "Sets the minimum length for a sequence before assembly",
                type: "numeric",
              },
              {
                name: "maxoverlap -O",
                value: 1,
                disabled: "never",
                tooltip:
                  "Sets the maximum overlap between forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "maxlen -L",
                value: 1,
                disabled: "never",
                tooltip: "Sets maximum length for a sequence before assembly.",
                type: "numeric",
              },
              {
                name: "write unpaired",
                value: false,
                disabled: "never",
                tooltip:
                  "Write sequences for which the optimal alignment cannot be computed to a file as concatenated pairs.",
                type: "bool",
              },
            ],
          },
          {
            scriptName: "flash-assemble.sh",
            imageName: "pipecraft/flash:2",
            serviceName: "flash",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "min overlap -m",
                value: 100,
                disabled: "never",
                tooltip:
                  "Set the minimum required overlap length between two reads to provide a confident overlap.",
                type: "numeric",
              },
              {
                name: "mismatch ratio -x",
                value: 0.25,
                disabled: "never",
                tooltip:
                  "Set the maximum allowed ratio of the number of mismatches at the overlap length.",
                type: "numeric",
              },
              {
                name: "max overlap -M",
                value: null,
                disabled: "never",
                tooltip:
                  "Set the maximum overlap length expected in approximately 90% of read pairs.",
                type: "numeric",
              },
              {
                name: "read length -r",
                value: 1,
                disabled: "never",
                tooltip: "Average read length.",
                type: "numeric",
              },
              {
                name: "fragment length -f",
                value: 1,
                disabled: "never",
                tooltip: "Average fragment length",
                type: "numeric",
              },
              {
                name: "σ fragment lengths -s",
                value: 1,
                disabled: "never",
                tooltip:
                  "if you do not know standard deviation of the fragment library, you can probably assume that the standard deviation is 10% of the average fragment length",
                type: "numeric",
              },
              {
                name: "phredOffset -p",
                value: 1,
                disabled: "never",
                tooltip:
                  "Set the smallest ASCII value of the characters used to represent quality values of bases in fastq files. 33 for latest Illumina and Sanger or 64 for earlier Illumina.",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "assemble_pairedend_data_vsearch.sh",
            imageName: "pipecraft/mothur:1.43",
            serviceName: "vsearch",
            disabled: "single_end",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "min overlength",
                value: 10,
                disabled: "never",
                tooltip: "minimum overlap between the merged reads",
                type: "numeric",
              },
              {
                name: "min lenght",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the merged sequence",
                type: "numeric",
              },
              {
                name: "allow merge stagger",
                value: true,
                disabled: "never",
                tooltip:
                  "allow to merge staggered read pairs. Staggered pairs are pairs where the 3’ end of the reverse read has an overhang to the left of the 5’ end of the forward read. This situation can occur when a very short fragment is sequenced.",
                type: "bool",
              },
              {
                name: "include only R1",
                value: false,
                disabled: "never",
                tooltip:
                  "include unassembled R1 reads to the set of assembled reads per sample. This may be relevant when working with e.g. ITS2 sequences, because the ITS2 region in some taxa is too long for assembly, therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences for these taxa will be represented in the final output. If this option = TRUE, then other specified options (lenght, max error rate etc.) have not been applied to R1 reads in the 'assembled' file. Thus, additional quality filtering (if this was done before assembling) should be run on the 'assembled' data.",
                type: "bool",
              },
              {
                name: "max diffs",
                value: 20,
                disabled: "never",
                tooltip:
                  "the maximum number of non-matching nucleotides allowed in the overlap region",
                type: "numeric",
              },
              {
                name: "max Ns",
                value: 0,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "max len",
                value: 600,
                disabled: "never",
                tooltip: "maximum length of the merged sequence",
                type: "numeric",
              },
              {
                name: "keep disjointed",
                value: false,
                disabled: "never",
                tooltip:
                  "output reads that were not merged into separate FASTQ files",
                type: "bool",
              },
              {
                name: "fastq qmax",
                value: 41,
                disabled: "never",
                tooltip:
                  "maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files.",
                type: "numeric",
              },
            ],
          },
        ],
      },
      {
        stepName: "remove chimeras",
        disabled: "never",
        services: [
          {
            scriptName: "dada2-chimera.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "method",
                items: ["consensus", "pooled", "per-sample"],
                value: "consensus",
                disabled: "never",
                tooltip:
                  "If 'pooled': The samples in the sequence table are all pooled together for bimera identification, If 'consensus': The samples in a sequence table are independently checked for bimeras, If 'per-sample': The samples in a sequence table are independently checked for bimeras",
                type: "select",
              },
            ],
          },
          {
            scriptName: "chimera_filtering_vsearch.sh",
            imageName: "pipecraft/vsearch:2.18.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "pre_cluster",
                value: 0.98,
                disabled: "never",
                tooltip:
                  "Default = 0.98. Identity percentage when performing 'pre-clustering' with --cluster_size for denovo chimera filtering with --uchime_denovo",
                max: 1,
                min: 0,
                step: 0.01,
                type: "slide",
              },
              {
                name: "min_unique_size",
                value: 1,
                disabled: "never",
                tooltip:
                  "Default = 1. Minimum amount of a unique sequences in a fasta file. If value = 1, then no sequences are discarded after dereplication; if value = 2, then sequences, which are represented only once in a given file are discarded; and so on.",
                type: "numeric",
              },
              {
                name: "denovno",
                value: true,
                disabled: "never",
                tooltip:
                  "Default = TRUE. Perform denovo chimera filtering with --uchime_denovo",
                type: "bool",
              },
              {
                name: "refrence based",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "Default = undefined. Perform reference database based chimera filtering with --uchime_ref. If denovo = TRUE, then reference based chimera filtering will be performed after denovo",
                type: "boolfile",
              },
            ],
          },
          {
            scriptName: "usearch-chimera.sh",
            imageName: "pipecraft/usearch",
            serviceName: "usearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "abskew",
                value: 1,
                disabled: "never",
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "abundance annotation",
                value: 1,
                disabled: "never",
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "denovo",
                value: false,
                disabled: "never",
                tooltip: "zzzZZzzZZZzzz",
                type: "bool",
              },
              {
                name: "refrence based",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip: "zzZZzz",
                type: "boolfile",
              },
            ],
          },
        ],
      },
      {
        stepName: "gene extraction",
        disabled: "never",
        services: [
          {
            scriptName: "itsx-extraction.sh",
            imageName: "pipecraft/itsx:latest",
            serviceName: "itsx",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "metaxa-extraction.sh",
            imageName: "pipecraft/metaxa:latest",
            serviceName: "metaxa",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "vxtractor-extraction.sh",
            imageName: "pipecraft/vxtractor:latest",
            serviceName: "vxtractor",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
        ],
      },
      {
        stepName: "cluster | ASV",
        disabled: "never",
        services: [
          // {
          //   scriptName: "mothur-cluster.sh",
          //   imageName: "pipecraft/mothur:1.43",
          //   serviceName: "mothur",
          //   selected: false,
          //   showExtra: false,
          //   extraInputs: [],
          //   Inputs: [],
          // },
          {
            scriptName: "dada2-asv.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          // {
          //   scriptName: "cd-hit-cluster.sh",
          //   imageName: "pipecraft/cdhit:4.8.1",
          //   serviceName: "cd-hit",
          //   selected: false,
          //   showExtra: false,
          //   extraInputs: [],
          //   Inputs: [],
          // },
          // {
          //   scriptName: "swarm-cluster.sh",
          //   imageName: "pipecraft/swarm:3.0.0",
          //   serviceName: "swarm",
          //   selected: false,
          //   showExtra: false,
          //   extraInputs: [],
          //   Inputs: [],
          // },
          {
            scriptName: "vsearch-cluster.sh",
            imageName: "pipecraft/vsearch:2.18.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
        ],
      },
      {
        stepName: "assing taxonomy",
        disabled: "never",
        services: [
          {
            scriptName: "",
            imageName: "",
            serviceName: "mothur",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "dada2-classifier.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "refFasta",
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip: "Select a reference fasta file",
                type: "file",
              },
              {
                name: "minBoot",
                value: 50,
                disabled: "never",
                tooltip:
                  "The minimum bootstrap confidence for assigning a taxonomic level.",
                type: "numeric",
              },
              {
                name: "tryRC",
                value: false,
                disabled: "never",
                tooltip:
                  "the reverse-complement of each sequences will be used for classification if it is a better match to the reference sequences than the forward sequence.",
                type: "bool",
              },
            ],
          },
          {
            scriptName: "",
            imageName: "",
            serviceName: "blast",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
        ],
      },
    ],
    OTU_Miseq: [
      {
        scriptName: "demux_paired_end_data.sh",
        imageName: "pipecraft/demux:0.1",
        serviceName: "demultiplex",
        disabled: "demultiplexed",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 2,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 10,
            disabled: "never",
            tooltip: "minimum length of the output sequence",
            type: "numeric",
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip: "do not allow insertions or deletions",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "index_file",
            value: "undefined",
            btnName: "select fasta",
            disabled: "never",
            tooltip:
              "Select your fasta formatted file for demultiplexing where fasta headers = sample names and sequences = sample specific index or index combination",
            type: "file",
          },
          {
            name: "index_mismatch",
            value: 1,
            disabled: "never",
            tooltip: "Default = 0. Allowed mismatches during the index search",
            type: "numeric",
          },
          {
            name: "overlap",
            value: 12,
            disabled: "never",
            tooltip:
              "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file.",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:2",
        serviceName: "reorient",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "mismatches",
            value: 2,
            disabled: "never",
            tooltip:
              "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
            type: "numeric",
          },
          //          {
          //            name: "paired_end_tags",
          //            value: ["R1", "R2"],
          //            disabled: "single_end",
          //            tooltip: "Define a tag for fwd and rev reads",
          //            type: "chip",
          //            iupac: false,
          //            rules: [(v) => v.length <= 2 || "TOO MANY TAGS"],
          //          },
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        scriptName: "cut_primers_paired_end_reads.sh",
        imageName: "pipecraft/demux:0.1",
        serviceName: "remove primers",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip:
              "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the output sequence.",
            type: "numeric",
          },
          {
            name: "overlap",
            value: 16,
            disabled: "never",
            tooltip:
              "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified error range).",
            type: "numeric",
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
            type: "bool",
          },
          {
            name: "discard_untrimmed",
            value: true,
            disabled: "never",
            tooltip:
              "Discard sequences where specified primers were not found.",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "mismatches",
            value: 2,
            disabled: "never",
            tooltip:
              "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
            type: "numeric",
          },
          {
            name: "min_overlap",
            value: 15,
            disabled: "never",
            tooltip:
              "the number of minimum overlap bases with the primer sequence.",
            type: "numeric",
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            disabled: "never",
            tooltip:
              "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
            type: "select",
          },
        ],
      },
      {
        scriptName: "assemble_paired_end_data_vsearch.sh",
        imageName: "pipecraft/vsearch:2.18",
        serviceName: "merge reads",
        selected: "always",
        disabled: "single_end",
        showExtra: false,
        extraInputs: [
          {
            name: "max_diffs",
            value: 20,
            disabled: "never",
            tooltip:
              "the maximum number of non-matching nucleotides allowed in the overlap region",
            type: "numeric",
          },
          {
            name: "max_Ns",
            value: 0,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of N’s",
            type: "numeric",
          },
          {
            name: "max_len",
            value: 600,
            disabled: "never",
            tooltip: "maximum length of the merged sequence",
            type: "numeric",
          },
          {
            name: "keep_disjointed",
            value: false,
            disabled: "never",
            tooltip:
              "output reads that were not merged into separate FASTQ files",
            type: "bool",
          },
          {
            name: "fastq_qmax",
            value: 41,
            disabled: "never",
            tooltip:
              "maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files.",
            type: "numeric",
          },
        ],
        Inputs: [
          {
            name: "min_overlap",
            value: 10,
            disabled: "never",
            tooltip: "minimum overlap between the merged reads",
            type: "numeric",
          },
          {
            name: "min_lenght",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the merged sequence",
            type: "numeric",
          },
          {
            name: "allow_merge_stagger",
            value: true,
            disabled: "never",
            tooltip:
              "allow to merge staggered read pairs. Staggered pairs are pairs where the 3’ end of the reverse read has an overhang to the left of the 5’ end of the forward read. This situation can occur when a very short fragment is sequenced.",
            type: "bool",
          },
          {
            name: "include_only_R1",
            value: false,
            disabled: "never",
            tooltip:
              "include unassembled R1 reads to the set of assembled reads per sample. This may be relevant when working with e.g. ITS2 sequences, because the ITS2 region in some taxa is too long for assembly, therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences for these taxa will be represented in the final output. If this option = TRUE, then other specified options (lenght, max error rate etc.) have not been applied to R1 reads in the 'assembled' file. Thus, additional quality filtering (if this was done before assembling) should be run on the 'assembled' data.",
            type: "bool",
          },
        ],
      },
      {
        scriptName: "quality_filtering_single_end_trimmomatic.sh",
        imageName: "pipecraft/trimmomatic:0.39",
        serviceName: "quality filter",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "leading_qual_threshold",
            value: null,
            disabled: "never",
            tooltip:
              "quality score threshold to remove low quality bases from the beginning of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
            type: "numeric",
          },
          {
            name: "trailing_qual_threshold",
            value: null,
            disabled: "never",
            tooltip:
              "quality score threshold to remove low quality bases from the end of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
            type: "numeric",
          },
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "Default = 4. Number of cores to use",
            type: "numeric",
          },
          {
            name: "phred",
            items: [33, 64],
            value: 33,
            disabled: "never",
            tooltip:
              "Default = 33. Phred quality scored encoding. Use phred64 if working with data from older Illumina (Solexa) machines",
            type: "select",
          },
        ],
        Inputs: [
          {
            name: "window_size",
            value: 5,
            disabled: "never",
            tooltip:
              "the number of bases to average base qualities. Starts scanning at the 5'-end of a sequence and trimms the read once the average required quality (required_qual) within the window size falls below the threshold.",
            type: "numeric",
          },
          {
            name: "required_quality",
            value: 27,
            disabled: "never",
            tooltip: "the average quality required for selected window size",
            type: "numeric",
          },
          {
            name: "min_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the filtered sequence",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "chimera_filtering_vsearch.sh",
        imageName: "pipecraft/vsearch:2.18",
        serviceName: "chimera filter",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "Default = 4. Number of cores to use",
            type: "numeric",
          },
          {
            name: "abundance_skew",
            value: 2,
            disabled: "never",
            tooltip:
              "Default = 2. The abundance skew is used to distinguish in a threeway alignment which sequence is the chimera and which are the parents. The assumption is that chimeras appear later in the PCR amplification process and are therefore less abundant than their parents. The default value is 2.0, which means that the parents should be at least 2 times more abundant than their chimera. Any positive value equal or greater than 1.0 can be used",
            type: "numeric",
          },
          {
            name: "min_h",
            value: 0.28,
            disabled: "never",
            tooltip:
              "Default = 0.28. Minimum score (h). Increasing this value tends to reduce the number of false positives and to decrease sensitivity. Values ranging from 0.0 to 1.0 included are accepted",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
        ],
        Inputs: [
          {
            name: "pre_cluster",
            value: 0.98,
            disabled: "never",
            tooltip:
              "Default = 0.98. Identity percentage when performing 'pre-clustering' with --cluster_size for denovo chimera filtering with --uchime_denovo",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
          {
            name: "min_unique_size",
            value: 1,
            disabled: "never",
            tooltip:
              "Default = 1. Minimum amount of a unique sequences in a fasta file. If value = 1, then no sequences are discarded after dereplication; if value = 2, then sequences, which are represented only once in a given file are discarded; and so on.",
            type: "numeric",
          },
          {
            name: "denovno",
            value: true,
            disabled: "never",
            tooltip:
              "Default = TRUE. Perform denovo chimera filtering with --uchime_denovo",
            type: "bool",
          },
          {
            name: "refrence_based",
            active: false,
            btnName: "select file",
            value: "undefined",
            disabled: "never",
            tooltip:
              "Default = undefined. Perform reference database based chimera filtering with --uchime_ref. If denovo = TRUE, then reference based chimera filtering will be performed after denovo",
            type: "boolfile",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "gene extraction",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "e-value",
            value: (0.00001).toExponential(),
            disabled: "never",
            tooltip:
              "domain E-value cutoff a sequence must obtain in the HMMER-based step to be included in the output",
            type: "numeric",
          },
          {
            name: "scores",
            value: 0,
            disabled: "never",
            tooltip:
              "domain score cutoff that a sequence must obtain in the HMMER-based step to be included in the output",
            type: "numeric",
          },
          {
            name: "domains",
            value: 2,
            disabled: "never",
            tooltip:
              "the minimum number of domains (different HMM gene profiles) that must match a sequence for it to be included in the output (detected as an ITS sequence). Setting the value lower than two will increase the number of false positives, while increasing it above two will decrease ITSx detection abilities on fragmentary data",
            type: "numeric",
          },
          {
            name: "complement",
            value: true,
            disabled: "never",
            tooltip:
              "If on, ITSx checks both DNA strands for matches to HMM-profiles",
            type: "bool",
          },
          {
            name: "only full",
            value: false,
            disabled: "never",
            tooltip:
              "If true, the output is limited to full-length ITS1 and ITS2 regions only",
            type: "bool",
          },
          {
            name: "truncate",
            value: true,
            disabled: "never",
            tooltip:
              "removes ends of ITS sequences if they are outside of the ITS region. If off, the whole input sequence is saved",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "Organisms",
            items: [
              "Alveolata",
              "Bryophyta",
              "Bacillariophyta",
              "Amoebozoa",
              "Euglenozoa",
              "Fungi",
              "Chlorophyta",
              "Rhodophyta",
              "Phaeophyceae",
              "Marchantiophyta",
              "Metazoa",
              "Oomycota",
              "Haptophyceae",
              "Raphidophyceae",
              "Rhizaria",
              "Synurophyceae",
              "Tracheophyta",
              "Eustigmatophyceae",
              "Apusozoa",
              "Parabasalia",
            ],
            value: [],
            disabled: "never",
            tooltip:
              "set of profiles to use for the search. Can be used to restrict the search to only a few organism groups types to save time, if one or more of the origins are not relevant to the dataset under study",
            type: "combobox",
          },
          {
            name: "Regions",
            items: ["SSU", "ITS1", "5.8S", "ITS2", "LSU"],
            value: [],
            disabled: "never",
            tooltip:
              "ITS regions to output (note that all will output also full ITS region [ITS1-5.8S-ITS2])",
            type: "combobox",
          },
          {
            name: "partial",
            value: 50,
            disabled: "never",
            tooltip:
              "if larger than 0, ITSx will save additional FASTA-files for full and partial ITS sequences longer than the specified cutoff value. If his setting is left to 0 (zero), it means OFF.",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "cluster.sh",
        imageName: "ppiecraft/",
        serviceName: "clustering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "similarity type",
            items: ["0", "1", "2", "3", "4"],
            value: "2",
            disabled: "never",
            tooltip:
              "pairwise sequence identity definition. Default = --iddef 2 [(matching columns) / (alignment length - terminal gaps)]",
            type: "select",
          },
          {
            name: "sequence sorting",
            items: ["cluster_fast", "cluster_size", "cluster_smallmem"],
            value: "cluster_size",
            disabled: "never",
            tooltip:
              'size = sort the sequences by decreasing abundance; "length" = sort the sequences by decreasing length (--cluster_fast); "no" = do not sort sequences (--cluster_smallmem --usersort)',
            type: "select",
          },
          {
            name: "centroid type",
            items: ["similarity", "abundance"],
            value: "similarity",
            disabled: "never",
            tooltip:
              '"similarity" = assign representative sequence to the closest (most similar) centroid (distance-based greedy clustering); "abundance" = assign representative sequence to the most abundant centroid (abundance-based greedy clustering; --sizeorder), --maxaccepts should be > 1',
            type: "select",
          },
          {
            name: "max hits",
            value: 1,
            disabled: "never",
            tooltip:
              "maximum number of hits to accept before stopping the search (should be > 1 for abundance-based selection of centroids [centroid type])",
            type: "numeric",
          },
          {
            name: "relabel",
            items: ["none", "md5m", "sha1"],
            value: "sha1",
            disabled: "never",
            tooltip: "relabel sequence identifiers (none = do not relabel)",
            type: "select",
          },
          {
            name: "mask",
            items: ["dust", "none"],
            value: "dust",
            disabled: "never",
            tooltip:
              'mask regions in sequences using the "dust" method, or do not mask ("none").',
            type: "select",
          },
          {
            name: "dbmask",
            items: ["dust", "none"],
            value: "dust",
            disabled: "never",
            tooltip:
              'prior the OTU table creation, mask regions in sequences using the "dust" method, or do not mask ("none").',
            type: "select",
          },
          {
            name: "output UC",
            value: false,
            disabled: "never",
            tooltip:
              "output clustering results in tab-separated UCLAST-like format",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "OTU type",
            items: ["centroid", "consensus"],
            disabled: "never",
            tooltip:
              '"centroid" = output centroid sequences; "consensus" = output consensus sequences',
            value: "centroid",
            type: "select",
          },
          {
            name: "similarity threshold",
            value: 0.97,
            disabled: "never",
            tooltip:
              "define OTUs based on the sequence similarity threshold; 0.97 = 97% similarity threshold",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
          {
            name: "strands",
            items: ["both", "plus"],
            disabled: "never",
            tooltip:
              "when comparing sequences with the cluster seed, check both strands (forward and reverse complementary) or the plus strand only",
            value: "both",
            type: "select",
          },
          {
            name: "min OTU size",
            value: 2,
            disabled: "never",
            tooltip:
              "minimum read count per output OTU (e.g., if value = 2, then singleton OTUs will be discarded [OTUs with only one sequence])",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "assign taxonomy",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "e-value",
            value: 10,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
          {
            name: "word size",
            value: 11,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
          {
            name: "reward",
            value: 2,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
          {
            name: "peanlty",
            value: -3,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
          {
            name: "gap open",
            value: 5,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
          {
            name: "gap extend",
            value: 2,
            disabled: "never",
            tooltip: "",
            type: "numeric",
          },
        ],
        Inputs: [
          {
            name: "database file(s)",
            btnName: "select file",
            value: "undefined",
            disabled: "never",
            tooltip:
              "database files, up to 5 files (may be fasta formated - automatically will convert to BLAST database format)",
            type: "file",
          },
          {
            name: "task",
            items: ["blastn", "megablast"],
            value: "blastn",
            disabled: "never",
            tooltip: "",
            type: "select",
          },
          {
            name: "strand",
            items: ["plus", "both"],
            value: "both",
            disabled: "never",
            tooltip: "",
            type: "select",
          },
        ],
      },
    ],
    DADA2_Miseq: [
      {
        scriptName: "demux_paired_end_data.sh",
        imageName: "pipecraft/demux:0.1",
        serviceName: "demultiplex",
        disabled: "demultiplexed",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 0,
            disabled: "never",
            tooltip: "Default = 0 (use all cores). Number of cores to use",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 20,
            disabled: "never",
            tooltip: "Default = 20. Minimum length of the output sequence",
            type: "numeric",
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "Default = TRUE (green): do not allow insertions or deletions is primer search so that mismatches are the only type of errors accounted in the error rate parameter",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "index_file",
            value: "undefined",
            btnName: "select fasta",
            disabled: "never",
            tooltip:
              "Select your fasta formatted file for demultiplexing where fasta headers = sample names and sequences = sample specific index or index combination",
            type: "file",
          },
          {
            name: "index_mismatch",
            value: 1,
            disabled: "never",
            tooltip: "Default = 0. Allowed mismatches during the index search",
            type: "numeric",
          },
          {
            name: "overlap",
            value: 12,
            disabled: "never",
            tooltip:
              "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file.",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "reorient",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "mismatches",
            value: 2,
            disabled: "never",
            tooltip: "Default = 2. Allowed mismatches during the primer search",
            type: "numeric",
          },
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip:
              "Specify your forward primer sequences in 5'-3' orientation (press ENTER to add). Add up to 13 PCR primers. IUPAC coder are allowed",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip:
              "Specify your reverse primer sequences in 3'-5' orientation (press ENTER to add). Add up to 13 PCR primers. IUPAC coder are allowed",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          //          {
          //            name: "paired_end_tags",
          //            value: ["_R1", "_R2"],
          //            disabled: "single_end",
          //            tooltip: "note that R1 and R2 files MUST CONTAINT stings 'R1' and 'R2', respectively! No edits allowed. Change file names",
          //            type: "chip",
          //         },
        ],
      },
      {
        scriptName: "cut_primers_paired_end_reads.sh",
        imageName: "pipecraft/demux:0.1",
        serviceName: "remove primers",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 0,
            disabled: "never",
            tooltip: "Default = 0 (use all cores). Number of cores to use",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 20,
            disabled: "never",
            tooltip: "Default = 20. Minimum length of the output sequence",
            type: "numeric",
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "Default = TRUE (green): do not allow insertions or deletions is primer search so that mismatches are the only type of errors accounted in the error rate parameter",
            type: "bool",
          },
          {
            name: "discard_untrimmed",
            value: true,
            disabled: "never",
            tooltip:
              "Default = TRUE (green): discard sequences where specified primers were not found",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip:
              "Specify your forward primer sequences in 5'-3' orientation (press ENTER to add). Add up to 13 PCR primers. IUPAC coder are allowed",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip:
              "Specify your reverse primer sequences in 3'-5' orientation (press ENTER to add). Add up to 13 PCR primers. IUPAC coder are allowed",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "mismatches",
            value: 2,
            disabled: "never",
            tooltip: "Default = 2. Allowed mismatches during the primer search",
            type: "numeric",
          },
          {
            name: "min_overlap",
            value: 16,
            disabled: "never",
            tooltip:
              "Default = 16. The number of minimum overlap bases with the primer sequence. Check your primer length; if this is set to be too short, then random matches can occur",
            type: "numeric",
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            disabled: "never",
            tooltip:
              "Default = 'keep all': keeps reads where at least one primer was found (keeps also partial amplicons). 'keep only linked' = keep only reads where forward and reverse primers were found (keeps only full amplicons)",
            type: "select",
          },
        ],
      },
      {
        scriptName: "dada2-quality.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "quality filter",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "read_R1",
            value: ["_R1"],
            disabled: "single_end",
            tooltip:
              "Identifyer string that is common for all R1 reads (default = '_R1'; i.e. all R1 files have '_R1' string)",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "read_R2",
            value: ["_R2"],
            disabled: "single_end",
            tooltip:
              "Identifyer string that is common for all R2 reads (default = '_R2'; i.e. all R2 files have '_R2' string)",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "samp_ID",
            value: ["_"],
            disabled: "never",
            tooltip:
              "Identifyer string that separates the sample name for redundant charachters (e.g. file name = sampl84_S73_L001_R1_001.fastq, then underscore '_' would be the 'identifier string' (sample name = sampl84))",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "maxEE",
            value: 2,
            disabled: "never",
            tooltip:
              "Default = 2. Discard sequences with more than the specified number of expected errors",
            type: "numeric",
          },
          {
            name: "maxN",
            value: 0,
            disabled: "never",
            tooltip:
              "Default = 0. Discard sequences with more than the specified number of N’s (ambiguous bases)",
            type: "numeric",
          },
          {
            name: "minLen",
            value: 20,
            disabled: "never",
            tooltip:
              "Default = 20. Remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
            type: "numeric",
          },
          {
            name: "truncQ",
            value: 2,
            disabled: "never",
            tooltip:
              "Default = 2. Truncate reads at the first instance of a quality score less than or equal to truncQ",
            type: "numeric",
          },
          {
            name: "truncLen",
            value: 0,
            disabled: "never",
            tooltip:
              "Default = 0 (no truncation). Truncate reads after truncLen bases (applies to R1 reads when working with paired-end data). Reads shorter than this are discarded. Explore quality profiles (with FastQC) see whether poor quality ends needs to truncated",
            type: "numeric",
          },
          {
            name: "truncLen_R2",
            value: 0,
            disabled: "single_end",
            tooltip:
              "Default = 0 (no truncation). Truncate R2 reads after truncLen bases. Reads shorter than this are discarded. Explore quality profiles (with FastQC) see whether poor quality ends needs to truncated",
            type: "numeric",
          },
          {
            name: "maxLen",
            value: 9999,
            disabled: "never",
            tooltip:
              "Remove reads with length greater than maxLen. maxLen is enforced on the raw reads. In dada2, the default = Inf, but here set as 9999",
            type: "numeric",
          },
          {
            name: "minQ",
            value: 0,
            disabled: "never",
            tooltip:
              "Default = 0. After truncation, reads contain a quality score below minQ will be discarded",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "dada2-assemble.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "denoise",
        selected: "always",
        disabled: "never",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "pool",
            items: ["FALSE", "TRUE", "psuedo"],
            value: "FALSE",
            disabled: "never",
            tooltip:
              "Default = FALSE: sample inference is performed on each sample individually. If pool = TRUE, the algorithm will pool together all samples prior to sample inference. Pooling improves the detection of rare variants, but is computationally more expensive. If pool = 'pseudo', the algorithm will perform pseudo-pooling between individually processed samples. This argument has no effect if only 1 sample is provided, and pool does not affect error rates, which are always estimated from pooled observations across samples.",
            type: "select",
          },
          {
            name: "selfConsist",
            disabled: "never",
            value: false,
            tooltip:
              "Default = FALSE. If selfConsist = TRUE, the algorithm will alternate between sample inference and error rate estimation until convergence",
            type: "bool",
          },
          {
            name: "qualityType",
            items: ["Auto", "FastqQuality"],
            value: "Auto",
            disabled: "never",
            tooltip:
              "Default = 'Auto': means to attempt to auto-detect the fastq quality encoding. This may fail for PacBio files with uniformly high quality scores, in which case use 'FastqQuality'",
            type: "select",
          },
        ],
      },
      {
        scriptName: "dada2-assemble.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "merge Pairs",
        selected: "always",
        disabled: "single_end",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "minOverlap",
            value: 12,
            disabled: "never",
            tooltip:
              "Default = 12. The minimum length of the overlap required for mergingthe forward and reverse reads.",
            type: "numeric",
          },
          {
            name: "maxMismatch",
            value: 0,
            disabled: "never",
            tooltip:
              "Default = 0. The maximum mismatches allowed in the overlap region",
            type: "numeric",
          },
          {
            name: "trimOverhang",
            value: false,
            disabled: "never",
            tooltip:
              "Default = FALSE. If TRUE, overhangs in the alignment between the forwards and reverse read are trimmed off. Overhangs are when the reverse read extends past the start of the forward read, and vice-versa, as can happen when reads are longer than the amplicon and read into the other-direction primer region.",
            type: "bool",
          },
          {
            name: "justConcatenate",
            value: false,
            disabled: "never",
            tooltip:
              "Default = FALSE. If TRUE, the forward and reverse-complemented reverse read are concatenated rather than merged, with a NNNNNNNNNN (10 Ns) spacer inserted between them",
            type: "bool",
          },
        ],
      },
      {
        scriptName: "dada2-chimera.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "remove chimeras",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "chim_method",
            items: ["consensus", "pooled", "per-sample"],
            value: "consensus",
            disabled: "never",
            tooltip:
              "Default = 'consensus': the samples in a sequence table are independently checked for chimeras. If 'pooled', the samples in the sequence table are all pooled together for chimera identification. If 'per-sample', the samples in a sequence table are independently checked for chimeras",
            type: "select",
          },
        ],
      },

      {
        scriptName: "dada2-classifier.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "assign Taxonomy",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "dada2_database",
            btnName: "select fasta",
            value: "undefined",
            disabled: "never",
            tooltip:
              "Select a reference database fasta file for taxonomy annotation",
            type: "file",
          },
          {
            name: "minBoot",
            value: 50,
            disabled: "never",
            tooltip:
              "Default = 50. The minimum bootstrap confidence for assigning a taxonomic level",
            type: "numeric",
          },
          {
            name: "tryRC",
            value: false,
            disabled: "never",
            tooltip:
              "Default = FALSE (grey). The reverse-complement of each sequences will be used for classification if it is a better match to the reference sequences than the forward sequence",
            type: "bool",
          },
        ],
      },
    ],
    customWorkflowInfo: {
      OTU_Miseq: { info: "placeholder", link: "placeholder" },
      DADA2_Miseq: {
        info: "This workflow is based on DADA2 pipeline tutorial",
        link: "https://benjjneb.github.io/dada2/tutorial.html",
      },
    },
  },
  getters: {
    selectedStepsReady: (state) => {
      let x = 0;
      for (let index of state.selectedSteps.entries()) {
        state.selectedSteps[index[0]].services.forEach((input) => {
          if (input.selected === true || input.selected == "always") {
            x = x + 1;
          }
        });
      }
      if (x == state.selectedSteps.length && state.selectedSteps.length > 0) {
        return true;
      } else {
        return false;
      }
    },
  },
  mutations: {
    // runInfo: { active: false, type: null, step: null, nrOfSteps: null },
    addRunInfo(state, payload) {
      let result = Object.fromEntries(
        Object.keys(state.runInfo).map((_, i) => [
          Object.keys(state.runInfo)[i],
          payload[i],
        ]),
      );
      state.runInfo = result;
    },
    toggle_PE_SE_scripts(state, payload) {
      for (const [key] of Object.entries(state.customWorkflowInfo)) {
        for (let i = 0; i < state[key].length; i++) {
          if (payload == "paired_end") {
            state[key][i].scriptName = state[key][i].scriptName.replace(
              "single_end",
              "paired_end",
            );
            if (state[key][i].disabled == "single_end") {
              state[key][i].selected = "always";
            }
          }
          if (payload == "single_end") {
            state[key][i].scriptName = state[key][i].scriptName.replace(
              "paired_end",
              "single_end",
            );
            if (state[key][i].disabled == "single_end") {
              state[key][i].selected = false;
            }
          }
        }
      }
      for (let i = 0; i < state.steps.length; i++) {
        for (let j = 0; j < state.steps[i].services.length; j++) {
          if (payload == "paired_end") {
            state.steps[i].services[j].scriptName = state.steps[i].services[
              j
            ].scriptName.replace("single_end", "paired_end");
          }
          if (payload == "single_end") {
            state.steps[i].services[j].scriptName = state.steps[i].services[
              j
            ].scriptName.replace("paired_end", "single_end");
          }
        }
      }
      for (let i = 0; i < state.selectedSteps.length; i++) {
        if (payload == "single_end") {
          state.selectedSteps = state.selectedSteps.filter(
            (item) => !(item.stepName == "assemble paired-end"),
          );
          if (router.currentRoute != "/home") {
            router.push("/home");
          }
        }
      }
    },
    toggle_demux_mux(state, payload) {
      for (const [key] of Object.entries(state.customWorkflowInfo)) {
        for (let i = 0; i < state[key].length; i++) {
          if (
            payload == "demultiplexed" &&
            state[key][i].disabled == "demultiplexed"
          ) {
            console.log(state[key][i].disabled);
            state[key][i].selected = false;
          }
          if (
            payload == "multiplexed" &&
            state[key][i].disabled == "demultiplexed"
          ) {
            state[key][i].selected = true;
          }
        }
      }
      for (let i = 0; i < state.selectedSteps.length; i++) {
        if (payload == "demultiplexed") {
          state.selectedSteps = state.selectedSteps.filter(
            (item) => !(item.stepName == "demultiplex"),
          );
          if (router.currentRoute != "/home") {
            router.push("/home");
          }
        }
      }
    },
    loadWorkflow(state, payload) {
      state.selectedSteps = payload;
    },
    toggleExtra(state, payload) {
      state.selectedSteps[payload.stepIndex].services[
        payload.serviceIndex
      ].showExtra = !state.selectedSteps[payload.serviceIndex].services[
        payload.serviceIndex
      ].showExtra;
    },
    toggleExtraCustomWorkflow(state, payload) {
      state[payload.workflowName][payload.serviceIndex].showExtra = !state[
        payload.workflowName
      ][payload.serviceIndex].showExtra;
    },
    addWorkingDir(state, filePath) {
      state.workingDir = filePath;
    },
    updateDockerStatus(state, payload) {
      state.dockerStatus = payload;
    },
    addInputDir(state, filePath) {
      state.inputDir = filePath;
    },
    addInputInfo(state, payload) {
      (state.data.dataFormat = payload.dataFormat),
        (state.data.fileFormat = payload.fileFormat),
        (state.data.readType = payload.readType);
    },
    removeStep(state, index) {
      state.selectedSteps.splice(index, 1);
    },
    addStep(state, payload) {
      let step = _.cloneDeep(payload.step);
      state.selectedSteps.push(step);
    },
    DraggableUpdate(state, value) {
      state.selectedSteps = value;
    },
    serviceInputUpdate(state, payload) {
      state.selectedSteps[payload.stepIndex].services[payload.serviceIndex] =
        payload.value;
    },
    inputUpdate(state, payload) {
      state.selectedSteps[payload.stepIndex].services[payload.serviceIndex][
        payload.listName
      ][payload.inputIndex].value = payload.value;
    },
    premadeInputUpdate(state, payload) {
      state[payload.workflowName][payload.serviceIndex][payload.listName][
        payload.inputIndex
      ].value = payload.value;
    },
    toggleActive(state, payload) {
      state.selectedSteps[payload.stepIndex].services[payload.serviceIndex][
        payload.listName
      ][payload.inputIndex].active = payload.value;
      if (payload.value == false) {
        state.selectedSteps[payload.stepIndex].services[payload.serviceIndex][
          payload.listName
        ][payload.inputIndex].value = "undefined";
      }
    },
    premadeToggleActive(state, payload) {
      state[payload.workflowName][payload.serviceIndex][payload.listName][
        payload.inputIndex
      ].active = payload.value;
      if (payload.value == false) {
        state[payload.workflowName][payload.serviceIndex][payload.listName][
          payload.inputIndex
        ].value = "undefined";
      }
    },
    checkService(state, payload) {
      for (
        let index = 0;
        index < state.selectedSteps[payload.stepIndex].services.length;
        index++
      ) {
        if (index === payload.serviceIndex) {
          state.selectedSteps[payload.stepIndex].services[index].selected =
            payload.selected;
        } else {
          state.selectedSteps[payload.stepIndex].services[
            index
          ].selected = false;
        }
      }
    },
    checkCustomService(state, payload) {
      state[payload.name][payload.serviceIndex].selected = payload.selected;
    },
  },
  actions: {},
  modules: {},
});
