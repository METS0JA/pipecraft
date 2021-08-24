import Vue from "vue";
import Vuex from "vuex";
var _ = require("lodash");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
        services: [
          {
            scriptName: "demultiplex.sh",
            imageName: "mothur:1.43",
            serviceName: "demultiplex",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "add a barcodes file",
                btnName: "select file",
                value: "No file selected",
                tooltip:
                  "Add a file that can contain the sequences of the forward and reverse primers and barcodes and their sample identfiers.",
                type: "file",
              },
              {
                name: "bdiffs",
                value: 1,
                tooltip:
                  "Maximum number of differences to the barcode sequence.",
                type: "numeric",
              },
              {
                name: "pdiffs",
                value: 2,
                tooltip:
                  "Maximum number of differences to the primer sequence.",
                type: "numeric",
              },
              {
                name: "tdiffs",
                value: 2,
                tooltip:
                  "Maximum total number of differences to the barcode and primer.",
                type: "numeric",
              },
              {
                name: "min_unique_size",
                value: 2,
                tooltip:
                  "Discard sequences with an abundance value smaller than set value",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "",
            imageName: "",
            serviceName: "example inputs",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "param1",
                value: 2,
                tooltip: "numeric",
                type: "numeric",
              },
              { name: "param2", value: true, tooltip: "boolean", type: "bool" },
              {
                name: "select 1",
                items: ["16S", "ITS", "18S"],
                value: "16S",
                tooltip: "selection",
                type: "select",
              },
              {
                name: "file 1",
                btnName: "select file",
                value: "undefined",
                tooltip: "file select",
                type: "file",
              },
              {
                name: "file 2",
                btnName: "select file",
                value: "undefined",
                tooltip: "boolean file select",
                active: false,
                type: "boolfile",
              },
              {
                name: "select 2",
                items: ["16S", "ITS", "18S"],
                tooltip: "boolean select",
                value: "undefined",
                active: true,
                type: "boolselect",
              },
              {
                name: "chips",
                value: ["ACCTTGG", "GCGTAAA", "YNAAGGCCTT"],
                tooltip: "IUPAC primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "slide",
                value: 0,
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
                tooltip: "combobreaker",
                type: "combobox",
              },
            ],
          },
        ],
      },
      {
        stepName: "reorient",
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
                tooltip: "???????????",
                type: "numeric",
              },

              {
                name: "forward_primers",
                value: [],
                tooltip: "manually define up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
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
        stepName: "remove adapters",
        services: [
          {
            scriptName: "cut_primers_paired_end_reads.sh",
            imageName: "pipecraft/cutadapt:2.10",
            serviceName: "cutadapt",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "error_rate",
                value: 0.15,
                tooltip:
                  "Allowed error rate in primer search. By default, error rate is 0.1, which means that in e.g. 1 error is allowd in a 10 bp primer (10% error rate).",
                type: "numeric",
              },
              {
                name: "min_seq_length",
                value: 10,
                tooltip: "minimum length of the output sequence",
                type: "numeric",
              },
              {
                name: "cores",
                value: 1,
                tooltip:
                  "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
                type: "numeric",
              },
              {
                name: "revcomp",
                value: true,
                tooltip:
                  "search also revere complementary matches for barcodes",
                type: "bool",
              },
              {
                name: "no_indels",
                value: false,
                tooltip:
                  "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
                type: "bool",
              },
              {
                name: "discard_untrimmed",
                value: true,
                tooltip:
                  "Discard sequences where specified primers were not found.",
                type: "bool",
              },
              {
                name: "seqs_to_keep",
                items: ["keep_all", "keep_only_linked"],
                value: "keep_all",
                tooltip:
                  "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
                type: "select",
              },
              {
                name: "forward_primers",
                value: [],
                tooltip: "Add up to 13 PCR primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
                tooltip: "Add up to 13 PCR primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
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
        services: [
          {
            scriptName: "vsearch-quality.sh",
            imageName: "pipecraft/vsearch:2.15.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "fastq_maxlen",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of bases",
                type: "numeric",
              },
              {
                name: "fastq_truncqual",
                value: 0,
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
                type: "numeric",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
                type: "numeric",
              },
              {
                name: "fastq_qmin",
                value: 0,
                tooltip:
                  "Specify the minimum quality score accepted for FASTQ files",
                type: "numeric",
              },
            ],
            Inputs: [
              {
                name: "fastq_maxee",
                value: 1,
                tooltip:
                  "Discard sequences with more than the specified number of expected error",
                type: "numeric",
              },
              {
                name: "fastq_maxns",
                value: 0,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "fastq_minlen",
                value: 1,
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
                tooltip:
                  "Set the minimum average quality score allowed over a window",
                type: "numeric",
              },
              {
                name: "qwindowsize",
                value: 32,
                tooltip: "Set the number of bases in a window",
                type: "numeric",
              },
              {
                name: "maxambig",
                value: 0,
                tooltip: "Set the number of allowed ambiguous base calls",
                type: "numeric",
              },
              {
                name: "qthreshold",
                value: null,
                tooltip:
                  "Discard sequences with a basecall below set quality value",
                type: "numeric",
              },
              {
                name: "minlength",
                value: null,
                tooltip:
                  "Discard sequences with less than the specified number of bases",
                type: "numeric",
              },
              {
                name: "maxlength",
                value: null,
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
                tooltip:
                  "Discard sequences with more than the specified number of expected errors",
                type: "numeric",
              },
              {
                name: "maxN",
                value: 0,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "minLen",
                value: 20,
                tooltip:
                  "Remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
                type: "numeric",
              },
              {
                name: "truncQ",
                value: null,
                tooltip:
                  "Truncate reads at the first instance of a quality score less than or equal to truncQ",
                type: "numeric",
              },
              {
                name: "truncLen",
                value: 0,
                tooltip:
                  "Truncate reads after truncLen bases. Reads shorter than this are discarded",
                type: "numeric",
              },
              {
                name: "maxLen",
                value: null,
                tooltip:
                  "Remove reads with length greater than maxLen. maxLen is enforced on the raw reads",
                type: "numeric",
              },
              {
                name: "minQ",
                value: 0,
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
                tooltip:
                  "Discard sequences with more than the specified number of expected errors for all bases in the read (is used after any truncation options have been applied).",
                type: "numeric",
              },
              {
                name: "fastq_maxns",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
                type: "numeric",
              },
              {
                name: "fastq_minlen",
                value: null,
                tooltip:
                  "Discard sequences with less than the specified number of bases",
                type: "numeric",
              },
              {
                name: "fastq_stripleft",
                value: null,
                tooltip: "Delete the first N bases in the read",
                type: "numeric",
              },
              {
                name: "fastq_truncqual",
                value: null,
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
                type: "numeric",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "trimmomatic-quality.sh",
            imageName: "pipecraft/trimmomatic:0.39",
            serviceName: "trimmomatic",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "windowSize",
                value: 1,
                tooltip:
                  "Perform a sliding window trimming, cutting once the average quality within the window falls below a treshold",
                type: "numeric",
              },
              {
                name: "requiredQuality",
                value: 0,
                tooltip:
                  "Perform a sliding window trimming, cutting once the average quality within the window falls below a treshold",
                type: "numeric",
              },
              {
                name: "LEADING",
                value: null,
                tooltip:
                  "Cut bases off the start of a read, if below a threshold quality",
                type: "numeric",
              },
              {
                name: "TRAILING",
                value: null,
                tooltip:
                  "Cut bases off the end of a read, if below a threshold quality",
                type: "numeric",
              },
              {
                name: "MINLEN",
                value: null,
                tooltip: "Drop the read if it is below a specified length",
                type: "numeric",
              },
              {
                name: "AVGQAUL",
                value: null,
                tooltip:
                  "Drop the read if the average quality is below the specified level",
                type: "numeric",
              },
            ],
          },
        ],
      },
      {
        stepName: "assemble paired-end",
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
                tooltip:
                  "The minimum length of the overlap required for mergingthe forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "maxMismatch",
                value: 0,
                tooltip: "The maximum mismatches allowed in the overlap region",
                type: "numeric",
              },
              {
                name: "returnRejects",
                value: false,
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
                tooltip:
                  "Sets the minimum overlap between forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "minlen -l",
                value: 1,
                tooltip:
                  "Sets the minimum length for a sequence before assembly",
                type: "numeric",
              },
              {
                name: "maxoverlap -O",
                value: 1,
                tooltip:
                  "Sets the maximum overlap between forward and reverse reads.",
                type: "numeric",
              },
              {
                name: "maxlen -L",
                value: 1,
                tooltip: "Sets maximum length for a sequence before assembly.",
                type: "numeric",
              },
              {
                name: "write unpaired",
                value: false,
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
                tooltip:
                  "Set the minimum required overlap length between two reads to provide a confident overlap.",
                type: "numeric",
              },
              {
                name: "mismatch ratio -x",
                value: 0.25,
                tooltip:
                  "Set the maximum allowed ratio of the number of mismatches at the overlap length.",
                type: "numeric",
              },
              {
                name: "max overlap -M",
                value: null,
                tooltip:
                  "Set the maximum overlap length expected in approximately 90% of read pairs.",
                type: "numeric",
              },
              {
                name: "read length -r",
                value: 1,
                tooltip: "Average read length.",
                type: "numeric",
              },
              {
                name: "fragment length -f",
                value: 1,
                tooltip: "Average fragment length",
                type: "numeric",
              },
              {
                name: "σ fragment lengths -s",
                value: 1,
                tooltip:
                  "if you do not know standard deviation of the fragment library, you can probably assume that the standard deviation is 10% of the average fragment length",
                type: "numeric",
              },
              {
                name: "phredOffset -p",
                value: 1,
                tooltip:
                  "Set the smallest ASCII value of the characters used to represent quality values of bases in fastq files. 33 for latest Illumina and Sanger or 64 for earlier Illumina.",
                type: "numeric",
              },
            ],
          },
          {
            scriptName: "vsearch-assemble.sh",
            imageName: "pipecraft/vsearch:2.15.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "--fastq_minmergelen",
                value: 1,
                tooltip: "Specify the minimum length of the merged sequence",
                type: "numeric",
              },
              {
                name: "--fastq_maxdiffs",
                value: 1,
                tooltip:
                  "Specify the maximum number of non-matching nucleotides allowed in the overlap region.",
                type: "numeric",
              },
              {
                name: "--fastq_minovlen",
                value: 1,
                tooltip: "Specify the minimum overlap between the mergedreads.",
                type: "numeric",
              },
              {
                name: "allowmergestagger",
                value: true,
                tooltip:
                  "Allow to merge staggered read pairs.(--fastq_allowmergestagger) Staggered pairsare pairs where the 3’ end of the reverse read has an overhang to the left of the 5’ end of the forward read",
                type: "bool",
              },
            ],
          },
        ],
      },
      {
        stepName: "remove chimeras",
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
                tooltip:
                  "If 'pooled': The samples in the sequence table are all pooled together for bimera identification, If 'consensus': The samples in a sequence table are independently checked for bimeras, If 'per-sample': The samples in a sequence table are independently checked for bimeras",
                type: "select",
              },
            ],
          },
          {
            scriptName: "vsearch-chimera.sh",
            imageName: "pipecraft/vsearch:2.15.0",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "abskew",
                value: 1,
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "abundace annotation",
                value: 1,
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "denovno",
                value: false,
                tooltip: "zzzZZzzZZZzzz",
                type: "bool",
              },
              {
                name: "refrence based",
                active: false,
                btnName: "select file",
                value: "undefined",
                tooltip: "zzzZZzzZZZzzz",
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
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "abundance annotation",
                value: 1,
                tooltip: "zzzZZzzZZZzzz",
                type: "numeric",
              },
              {
                name: "denovo",
                value: false,
                tooltip: "zzzZZzzZZZzzz",
                type: "bool",
              },
              {
                name: "refrence based",
                active: false,
                btnName: "select file",
                value: "undefined",
                tooltip: "zzZZzz",
                type: "boolfile",
              },
            ],
          },
        ],
      },
      {
        stepName: "gene extraction",
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
        services: [
          {
            scriptName: "mothur-cluster.sh",
            imageName: "pipecraft/mothur:1.43",
            serviceName: "mothur",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "dada2-asv.R",
            imageName: "pipecraft/dada2:3.10",
            serviceName: "dada2",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "cd-hit-cluster.sh",
            imageName: "pipecraft/cdhit:4.8.1",
            serviceName: "cd-hit",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "swarm-cluster.sh",
            imageName: "pipecraft/swarm:3.0.0",
            serviceName: "swarm",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [],
          },
          {
            scriptName: "vsearch-cluster.sh",
            imageName: "pipecraft/vsearch:2.15.0",
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
                tooltip: "Select a reference fasta file",
                type: "file",
              },
              {
                name: "minBoot",
                value: 50,
                tooltip:
                  "The minimum bootstrap confidence for assigning a taxonomic level.",
                type: "numeric",
              },
              {
                name: "tryRC",
                value: false,
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
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 2,
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 10,
            tooltip: "minimum length of the output sequence",
            type: "numeric",
          },
          {
            name: "no_indels",
            value: true,
            tooltip: "do not allow insertions or deletions",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "barcodes_file",
            value: "undefined",
            btnName: "select fast(a/q)",
            tooltip:
              "a file in a fasta format where the headers are sample ids and sequences are barcodes for samples",
            type: "file",
          },
          {
            name: "max_error_rate",
            value: 1,
            tooltip: "number of allowed mismatches in the index sequence",
            type: "numeric",
          },
          {
            name: "overlap",
            value: 12,
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
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "mismatches",
            value: 2,
            tooltip:
              "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
            type: "numeric",
          },
          {
            name: "paired-end_tags",
            value: ["R1", "R2"],
            tooltip: "Define a tag for fwd and rev reads",
            type: "chip",
            iupac: false,
            rules: [(v) => v.length <= 2 || "TOO MANY TAGS"],
          },
          {
            name: "forward_primers",
            value: [],
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        scriptName: "cut.sh",
        imageName: "pipecraft/cutadapt",
        serviceName: "cut primers",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            tooltip:
              "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
            type: "numeric",
          },
          {
            name: "min seq lenght",
            value: 32,
            tooltip: "minimum length of the output sequence.",
            type: "numeric",
          },
          {
            name: "overlap",
            value: 16,
            tooltip:
              "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified error range).",
            type: "numeric",
          },
          {
            name: "no indels",
            value: true,
            tooltip:
              "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
            type: "bool",
          },
          {
            name: "discard untrimmed",
            value: true,
            tooltip:
              "Discard sequences where specified primers were not found.",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "forward_primers",
            value: [],
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "mismatches",
            value: 2,
            tooltip:
              "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
            type: "numeric",
          },
          {
            name: "min overlap",
            value: 15,
            tooltip:
              "the number of minimum overlap bases with the primer sequence.",
            type: "numeric",
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            tooltip:
              "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
            type: "select",
          },
        ],
      },
      {
        scriptName: "mergepaired.sh",
        imageName: "pipecraft/vsearch",
        serviceName: "merge PE reads",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "max diffs",
            value: 20,
            tooltip:
              "the maximum number of non-matching nucleotides allowed in the overlap region",
            type: "numeric",
          },
          {
            name: "max Ns",
            value: 0,
            tooltip:
              "discard sequences with more than the specified number of N’s",
            type: "numeric",
          },
          {
            name: "max len",
            value: 600,
            tooltip: "maximum length of the merged sequence",
            type: "numeric",
          },
          {
            name: "keep disjointed",
            value: false,
            tooltip:
              "output reads that were not merged into separate FASTQ files",
            type: "bool",
          },
          {
            name: "fastq qmax",
            value: 41,
            tooltip:
              "maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files.",
            type: "numeric",
          },
        ],
        Inputs: [
          {
            name: "min overlength",
            value: 10,
            tooltip: "minimum overlap between the merged reads",
            type: "numeric",
          },
          {
            name: "min lenght",
            value: 32,
            tooltip: "minimum length of the merged sequence",
            type: "numeric",
          },
          {
            name: "allow merge stagger",
            value: true,
            tooltip:
              "allow to merge staggered read pairs. Staggered pairs are pairs where the 3’ end of the reverse read has an overhang to the left of the 5’ end of the forward read. This situation can occur when a very short fragment is sequenced.",
            type: "bool",
          },
          {
            name: "include only R1",
            value: false,
            tooltip:
              "include unassembled R1 reads to the set of assembled reads per sample. This may be relevant when working with e.g. ITS2 sequences, because the ITS2 region in some taxa is too long for assembly, therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences for these taxa will be represented in the final output. If this option = TRUE, then other specified options (lenght, max error rate etc.) have not been applied to R1 reads in the 'assembled' file. Thus, additional quality filtering (if this was done before assembling) should be run on the 'assembled' data.",
            type: "bool",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "quality filter",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "leading qual threshold",
            value: null,
            tooltip:
              "quality score threshold to remove low quality bases from the beginning of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
            type: "numeric",
          },
          {
            name: "trailing qual threshold",
            value: null,
            tooltip:
              "quality score threshold to remove low quality bases from the end of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated.",
            type: "numeric",
          },
          {
            name: "cores",
            value: 4,
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "phred",
            items: [33, 64],
            value: 0,
            tooltip:
              "phred quality scored encoding. Default is phred33. Use phred64 if working with data from older Illumina (Solexa) machines. ",
            type: "select",
          },
        ],
        Inputs: [
          {
            name: "window size",
            value: 5,
            tooltip:
              "the number of bases to average base qualities. Starts scanning at the 5'-end of a sequence and trimms the read once the average required quality (required_qual) within the window size falls below the threshold.",
            type: "numeric",
          },
          {
            name: "required quality",
            value: 27,
            tooltip: "the average quality required for selected window size",
            type: "numeric",
          },
          {
            name: "min length",
            value: 32,
            tooltip: "minimum length of the filtered sequence",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "chimera filter",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "abundance skew",
            value: 2,
            tooltip:
              "the abundance skew is used to distinguish in a threeway alignment which sequence is the chimera and which are the parents. The assumption is that chimeras appear later in the PCR amplification process and are therefore less abundant than their parents. The default value is 2.0, which means that the parents should be at least 2 times more abundant than their chimera. Any positive value equal or greater than 1.0 can be used.",
            type: "numeric",
          },
          {
            name: "min-h",
            value: 0.28,
            tooltip:
              "minimum score (h). Increasing this value tends to reduce the number of false positives and to decrease sensitivity. Default value is 0.28, and values ranging from 0.0 to 1.0 included are accepted.",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
        ],
        Inputs: [
          {
            name: "pre-cluster",
            value: 0.98,
            tooltip:
              "identity percentage when performing 'pre-clustering' with --cluster_size for denovo chimera filtering with --uchime_denovo",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
          {
            name: "min unique size",
            value: 1,
            tooltip:
              "minimum amount of a unique sequences in a fasta file. If value = 1, then no sequences are discarded after dereplication; if value = 2, then sequences, which are represented only once in a given file are discarded; and so on.",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "reorient_paired_end_reads.sh",
        imageName: "pipecraft/reorient:1",
        serviceName: "gene extraction",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            tooltip: "number of cores to use",
            type: "numeric",
          },
          {
            name: "e-value",
            value: (0.00001).toExponential(),
            tooltip:
              "domain E-value cutoff a sequence must obtain in the HMMER-based step to be included in the output",
            type: "numeric",
          },
          {
            name: "scores",
            value: 0,
            tooltip:
              "domain score cutoff that a sequence must obtain in the HMMER-based step to be included in the output",
            type: "numeric",
          },
          {
            name: "domains",
            value: 2,
            tooltip:
              "the minimum number of domains (different HMM gene profiles) that must match a sequence for it to be included in the output (detected as an ITS sequence). Setting the value lower than two will increase the number of false positives, while increasing it above two will decrease ITSx detection abilities on fragmentary data",
            type: "numeric",
          },
          {
            name: "complement",
            value: true,
            tooltip:
              "If on, ITSx checks both DNA strands for matches to HMM-profiles",
            type: "bool",
          },
          {
            name: "only full",
            value: false,
            tooltip:
              "If true, the output is limited to full-length ITS1 and ITS2 regions only",
            type: "bool",
          },
          {
            name: "truncate",
            value: true,
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
            tooltip:
              "set of profiles to use for the search. Can be used to restrict the search to only a few organism groups types to save time, if one or more of the origins are not relevant to the dataset under study",
            type: "combobox",
          },
          {
            name: "Regions",
            items: ["SSU", "ITS1", "5.8S", "ITS2", "LSU"],
            value: [],
            tooltip:
              "ITS regions to output (note that all will output also full ITS region [ITS1-5.8S-ITS2])",
            type: "combobox",
          },
          {
            name: "partial",
            value: 50,
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
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "similarity type",
            items: ["0", "1", "2", "3", "4"],
            value: "2",
            tooltip:
              "pairwise sequence identity definition. Default = --iddef 2 [(matching columns) / (alignment length - terminal gaps)]",
            type: "select",
          },
          {
            name: "sequence sorting",
            items: ["cluster_fast", "cluster_size", "cluster_smallmem"],
            value: "cluster_size",
            tooltip:
              'size = sort the sequences by decreasing abundance; "length" = sort the sequences by decreasing length (--cluster_fast); "no" = do not sort sequences (--cluster_smallmem --usersort)',
            type: "select",
          },
          {
            name: "centroid type",
            items: ["similarity", "abundance"],
            value: "similarity",
            tooltip:
              '"similarity" = assign representative sequence to the closest (most similar) centroid (distance-based greedy clustering); "abundance" = assign representative sequence to the most abundant centroid (abundance-based greedy clustering; --sizeorder), --maxaccepts should be > 1',
            type: "select",
          },
          {
            name: "max hits",
            value: 1,
            tooltip:
              "maximum number of hits to accept before stopping the search (should be > 1 for abundance-based selection of centroids [centroid type])",
            type: "numeric",
          },
          {
            name: "relabel",
            items: ["none", "md5m", "sha1"],
            value: "sha1",
            tooltip: "relabel sequence identifiers (none = do not relabel)",
            type: "select",
          },
          {
            name: "mask",
            items: ["dust", "none"],
            value: "dust",
            tooltip:
              'mask regions in sequences using the "dust" method, or do not mask ("none").',
            type: "select",
          },
          {
            name: "dbmask",
            items: ["dust", "none"],
            value: "dust",
            tooltip:
              'prior the OTU table creation, mask regions in sequences using the "dust" method, or do not mask ("none").',
            type: "select",
          },
          {
            name: "output UC",
            value: false,
            tooltip:
              "output clustering results in tab-separated UCLAST-like format",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "OTU type",
            items: ["centroid", "consensus"],
            tooltip:
              '"centroid" = output centroid sequences; "consensus" = output consensus sequences',
            value: "centroid",
            type: "select",
          },
          {
            name: "similarity threshold",
            value: 0.97,
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
            tooltip:
              "when comparing sequences with the cluster seed, check both strands (forward and reverse complementary) or the plus strand only",
            value: "both",
            type: "select",
          },
          {
            name: "min OTU size",
            value: 2,
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
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "e-value",
            value: 10,
            tooltip: "",
            type: "numeric",
          },
          {
            name: "word size",
            value: 11,
            tooltip: "",
            type: "numeric",
          },
          {
            name: "reward",
            value: 2,
            tooltip: "",
            type: "numeric",
          },
          {
            name: "peanlty",
            value: -3,
            tooltip: "",
            type: "numeric",
          },
          {
            name: "gap open",
            value: 5,
            tooltip: "",
            type: "numeric",
          },
          {
            name: "gap extend",
            value: 2,
            tooltip: "",
            type: "numeric",
          },
        ],
        Inputs: [
          {
            name: "database file(s)",
            btnName: "select file",
            value: "undefined",
            tooltip:
              "database files, up to 5 files (may be fasta formated - automatically will convert to BLAST database format)",
            type: "file",
          },
          {
            name: "task",
            items: ["blastn", "megablast"],
            value: "blastn",
            tooltip: "",
            type: "select",
          },
          {
            name: "strand",
            items: ["plus", "both"],
            value: "both",
            tooltip: "",
            type: "select",
          },
        ],
      },
    ],
    dada2Miseq: [
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
            tooltip:
              "allowed mismatches in primer search. By default, 2 mismatches are allowed per primer.",
            type: "numeric",
          },
          {
            name: "paired-end_tags",
            value: ["R1", "R2"],
            tooltip: "Define a tag for fwd and rev reads",
            type: "chip",
            iupac: false,
            rules: [(v) => v.length <= 2 || "TOO MANY TAGS"],
          },
          {
            name: "forward_primers",
            value: [],
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            tooltip: "manually define up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        scriptName: "cut_primers_paired_end_reads.sh",
        imageName: "pipecraft/cutadapt:3.40",
        serviceName: "cutadapt",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "error_rate",
            value: 0.15,
            tooltip:
              "Allowed error rate in primer search. By default, error rate is 0.1, which means that in e.g. 1 error is allowd in a 10 bp primer (10% error rate).",
            type: "numeric",
          },
          {
            name: "min_seq_length",
            value: 10,
            tooltip: "minimum length of the output sequence",
            type: "numeric",
          },
          {
            name: "cores",
            value: 1,
            tooltip:
              "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
            type: "numeric",
          },
          {
            name: "revcomp",
            value: true,
            tooltip: "search also revere complementary matches for barcodes",
            type: "bool",
          },
          {
            name: "no_indels",
            value: false,
            tooltip:
              "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
            type: "bool",
          },
          {
            name: "discard_untrimmed",
            value: true,
            tooltip:
              "Discard sequences where specified primers were not found.",
            type: "bool",
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            tooltip:
              "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
            type: "select",
          },
          {
            name: "forward_primers",
            value: [],
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            tooltip: "Add up to 13 PCR primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        scriptName: "dada2-quality.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "filterAndTrim",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "maxEE",
            value: 1,
            tooltip:
              "Discard sequences with more than the specified number of expected errors",
            type: "numeric",
          },
          {
            name: "maxN",
            value: 0,
            tooltip:
              "Discard sequences with more than the specified number of N’s",
            type: "numeric",
          },
          {
            name: "minLen",
            value: 20,
            tooltip:
              "Remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
            type: "numeric",
          },
          {
            name: "truncQ",
            value: null,
            tooltip:
              "Truncate reads at the first instance of a quality score less than or equal to truncQ",
            type: "numeric",
          },
          {
            name: "truncLen",
            value: 0,
            tooltip:
              "Truncate reads after truncLen bases. Reads shorter than this are discarded",
            type: "numeric",
          },
          {
            name: "maxLen",
            value: null,
            tooltip:
              "Remove reads with length greater than maxLen. maxLen is enforced on the raw reads",
            type: "numeric",
          },
          {
            name: "minQ",
            value: 0,
            tooltip:
              "After truncation, reads contain a quality score below minQ will be discarded",
            type: "numeric",
          },
        ],
      },
      {
        scriptName: "dada2-assemble.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "mergePairs",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "minOverlap",
            value: 12,
            tooltip:
              "The minimum length of the overlap required for mergingthe forward and reverse reads.",
            type: "numeric",
          },
          {
            name: "maxMismatch",
            value: 0,
            tooltip: "The maximum mismatches allowed in the overlap region",
            type: "numeric",
          },
          {
            name: "returnRejects",
            value: false,
            tooltip:
              "Return and retain, the pairs that that were rejected based on mismatches in the overlap region",
            type: "bool",
          },
        ],
      },
      {
        scriptName: "dada2-chimera.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "removeBimeraDenovo",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "method",
            items: ["consensus", "pooled", "per-sample"],
            value: "consensus",
            tooltip:
              "If 'pooled': The samples in the sequence table are all pooled together for bimera identification, If 'consensus': The samples in a sequence table are independently checked for bimeras, If 'per-sample': The samples in a sequence table are independently checked for bimeras",
            type: "select",
          },
        ],
      },

      {
        scriptName: "dada2-classifier.R",
        imageName: "pipecraft/dada2:3.10",
        serviceName: "assignTaxonomy",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "refFasta",
            btnName: "select file",
            value: "undefined",
            tooltip: "Select a reference fasta file",
            type: "file",
          },
          {
            name: "minBoot",
            value: 50,
            tooltip:
              "The minimum bootstrap confidence for assigning a taxonomic level.",
            type: "numeric",
          },
          {
            name: "tryRC",
            value: false,
            tooltip:
              "the reverse-complement of each sequences will be used for classification if it is a better match to the reference sequences than the forward sequence.",
            type: "bool",
          },
        ],
      },
    ],
  },
  getters: {},
  mutations: {
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
  },
  actions: {},
  modules: {},
});
