import Vue from "vue";
import Vuex from "vuex";
import router from "../router/index.js";
var _ = require("lodash");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dockerStatus: "",
    Qcheck: {
      fileExtension: "",
      folderPath: "",
      reportReady: false,
      reportLoading: false,
      dockerActive: false,
    },
    runInfo: {
      active: false,
      type: null,
      step: null,
      nrOfSteps: null,
      containerID: null,
    },
    pullLoader: {
      active: false,
    },
    pullLoader2: {
      active: false,
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
            tooltip:
              "demultiplex data to per-sample files based on specified index file. Note that for read1 and read2 will get .R1 and .R2 identifiers when demultiplexing paired-end data",
            scriptName: "demux_paired_end_data.sh",
            imageName: "pipecraft/cutadapt:3.5",
            serviceName: "demultiplex",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "cores",
                value: 1,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_seq_length",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the output sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "no_indels",
                value: true,
                disabled: "never",
                tooltip:
                  "do not allow insertions or deletions in the index sequence",
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
                  "select your fasta formatted indexes file for demultiplexing, where fasta headers are sample names, and sequences are sample specific index or index combination",
                type: "file",
              },
              {
                name: "index_file_example",
                value:
                  "https://pipecraft2-manual.readthedocs.io/en/stable/user_guide.html#indexes-file-example-fasta-formatted",
                disabled: "never",
                type: "link",
                tooltip: "link to PipeCraft manual page, index file examples",
              },
              {
                name: "index_mismatch",
                value: 0,
                disabled: "never",
                tooltip: "allowed mismatches during the index search",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "overlap",
                value: 8,
                disabled: "never",
                tooltip:
                  "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
          },
          // {
          //   tooltip: "",  scriptName: "exampleScript.sh",
          //   imageName: "exmaple:image",
          //   serviceName: "example inputs",
          //   selected: false,
          //   showExtra: false,
          //   extraInputs: [],
          //   Inputs: [
          //     {
          //       name: "param1",
          //       value: 2,
          //       disabled: "never",
          //       tooltip: "numeric",
          //       type: "numeric",
          //     },
          //     {
          //       name: "param2",
          //       value: true,
          //       disabled: "never",
          //       tooltip: "boolean",
          //       type: "bool",
          //     },
          //     {
          //       name: "select 1",
          //       items: ["16S", "ITS", "18S"],
          //       value: "16S",
          //       disabled: "never",
          //       tooltip: "selection",
          //       type: "select",
          //     },
          //     {
          //       name: "file 1",
          //       btnName: "select file",
          //       value: "undefined",
          //       disabled: "never",
          //       tooltip: "file select",
          //       type: "file",
          //     },
          //     {
          //       name: "file 2",
          //       btnName: "select file",
          //       value: "undefined",
          //       disabled: "never",
          //       tooltip: "boolean file select",
          //       active: false,
          //       type: "boolfile",
          //     },
          //     {
          //       name: "select 2",
          //       items: ["16S", "ITS", "18S"],
          //       disabled: "never",
          //       tooltip: "boolean select",
          //       value: "undefined",
          //       active: true,
          //       type: "boolselect",
          //     },
          //     {
          //       name: "chips",
          //       value: ["ACCTTGG", "GCGTAAA", "YNAAGGCCTT"],
          //       disabled: "never",
          //       tooltip: "IUPAC primers",
          //       type: "chip",
          //       iupac: true,
          //       rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          //     },
          //     {
          //       name: "slide",
          //       value: 0,
          //       disabled: "never",
          //       tooltip: "slide 4 life",
          //       max: 1,
          //       min: 0,
          //       step: 0.01,
          //       type: "slide",
          //     },
          //     {
          //       name: "combobox",
          //       items: ["nii", "palju", "asju", "mida", "valida"],
          //       value: [],
          //       disabled: "never",
          //       tooltip: "combobreaker",
          //       type: "combobox",
          //     },
          //   ],
          // },
        ],
      },
      {
        stepName: "reorient",
        disabled: "never",
        services: [
          {
            tooltip: "reorient reads based on specified primer sequences",
            scriptName: "reorient_paired_end_reads.sh",
            imageName: "pipecraft/reorient:1",
            serviceName: "reorient",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "mismatches",
                value: 1,
                disabled: "never",
                tooltip: "allowed mismatches in the primer search",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "forward_primers",
                value: [],
                disabled: "never",
                tooltip: "specify forward primer (5'-3'); add up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
                disabled: "never",
                tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
            ],
          },
        ],
      },
      {
        stepName: "cut primers",
        disabled: "never",
        services: [
          {
            tooltip: "remove primers sequences from the reads",
            scriptName: "cut_primers_paired_end_reads.sh",
            imageName: "pipecraft/cutadapt:3.5",
            serviceName: "cutadapt",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "cores",
                value: 1,
                disabled: "never",
                tooltip:
                  "number of cores to use. For paired-end data in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_seq_length",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the output sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "no_indels",
                value: true,
                disabled: "never",
                tooltip:
                  "do not allow insertions or deletions is primer search. Mismatches are the only type of errors accounted in the error rate parameter. ",
                type: "bool",
              },
            ],
            Inputs: [
              {
                name: "forward_primers",
                value: [],
                disabled: "never",
                tooltip: "specify forward primer (5'-3'); add up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "reverse_primers",
                value: [],
                disabled: "never",
                tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
                type: "chip",
                iupac: true,
                rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
              },
              {
                name: "mismatches",
                value: 1,
                disabled: "never",
                tooltip: "allowed mismatches in the primer search",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "min_overlap",
                value: 21,
                disabled: "never",
                tooltip:
                  "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified mismatch error range)",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "seqs_to_keep",
                items: ["keep_all", "keep_only_linked"],
                value: "keep_all",
                disabled: "never",
                tooltip:
                  "'keep_all' keeps the sequences where at least one primer was found (fwd or rev); recommended when cutting primers from paired-end data (unassembled), where individual R1 or R2 read lenghts are shorther than the expected amplicon length. 'keep_only_linked' = keep sequences if primers are found in both ends (fwd…rev); discards the read if both primers were not found in this read; maybe useful for single-end data",
                type: "select",
              },
              {
                name: "pair_filter",
                items: ["both", "any"],
                value: "both",
                disabled: "never",
                tooltip:
                  "applies only for paired-end data. 'both', means that a read is discarded only if both, corresponding R1 and R2, reads  do not contain primer strings (i.e. a read is kept if R1 contains primer string, but no primer string found in R2 read). Option 'any' discards the read if primers are not found in both, R1 and R2 reads",
                type: "select",
              },
            ],
          },
        ],
      },
      {
        stepName: "quality filtering",
        disabled: "never",
        services: [
          {
            tooltip: "quality filtering with vsearch",
            scriptName: "quality_filtering_paired_end_vsearch.sh",
            imageName: "pipecraft/vsearch:2.18",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "cores",
                value: 1,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "max_length",
                value: null,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of bases. Note that if 'trunc length' setting is specified, then 'max length' SHOULD NOT be lower than 'trunc lenght' (otherwise all reads are discared) [empty field = no action taken]",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (=no action taken)",
                ],
              },
              {
                name: "qmax",
                value: 41,
                disabled: "never",
                tooltip:
                  "specify the maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files. For PacBio data use 93",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "qmin",
                value: 0,
                disabled: "never",
                tooltip:
                  "the minimum quality score accepted for FASTQ files. The default is 0, which is usual for recent Sanger/Illumina 1.8+ files. Older formats may use scores between -5 and 2",
                type: "numeric",
                rules: [(v) => v >= -5 || "ERROR: specify values >= -5"],
              },
              {
                name: "maxee_rate",
                value: null,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of expected errors per base (empty field = no action taken)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 0.1) | (v == "") ||
                    "ERROR: specify values >= 0.1 or leave it empty (=no action taken)",
                ],
              },
              // {
              //   name: "min_size",
              //   value: 1,
              //   disabled: "never",
              //   tooltip:
              //     "discard sequences with an abundance lower than the specified value",
              //   type: "numeric",
              //   rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              // },
            ],
            Inputs: [
              {
                name: "maxee",
                value: 1,
                disabled: "never",
                tooltip:
                  "maximum number of expected errors per sequence. Sequences with higher error rates will be discarded",
                type: "numeric",
                rules: [(v) => v >= 0.1 || "ERROR: specify values >= 0.1"],
              },
              {
                name: "maxNs",
                value: 0,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of Ns",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "min_length",
                value: 32,
                disabled: "never",
                tooltip:
                  "minimum length of the filtered output sequence. Note that if 'trunc length' setting is specified, then 'min length' SHOULD BE lower than 'trunc lenght' (otherwise all reads are discared)",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "trunc_length",
                value: null,
                disabled: "never",
                tooltip:
                  "truncate sequences to the specified length. Shorter sequences are discarded; thus if specified, check that 'min length' setting is lower than 'trunc length' ('min lenght' therefore has basically no effect) [empty field = no action taken]",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 5) | (v == "") ||
                    "ERROR: specify values >= 5 or leave it empty (=no action taken)",
                ],
              },
            ],
          },
          {
            tooltip: "quality filtering with trimmomatic",
            scriptName: "quality_filtering_paired_end_trimmomatic.sh",
            imageName: "pipecraft/trimmomatic:0.39",
            serviceName: "trimmomatic",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "leading_qual_threshold",
                value: null,
                disabled: "never",
                tooltip:
                  "quality score threshold to remove low quality bases from the beginning of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated (empty field = no action taken)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (=no action taken)",
                ],
              },
              {
                name: "trailing_qual_threshold",
                value: null,
                disabled: "never",
                tooltip:
                  "quality score threshold to remove low quality bases from the end of the read. As long as a base has a value below this threshold the base is removed and the next base will be investigated (empty field = no action taken)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (=no action taken)",
                ],
              },
              {
                name: "cores",
                value: 1,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "phred",
                items: [33, 64],
                value: 33,
                disabled: "never",
                tooltip:
                  "phred quality scored encoding. Use phred64 if working with data from older Illumina (Solexa) machines",
                type: "select",
              },
            ],
            Inputs: [
              {
                name: "window_size",
                value: 5,
                disabled: "never",
                tooltip:
                  "the number of bases to average base qualities. Starts scanning at the 5'-end of a sequence and trimms the read once the average required quality (required_qual) within the window size falls below the threshold",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "required_quality",
                value: 27,
                disabled: "never",
                tooltip:
                  "the average quality required for selected window size",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_length",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the filtered output sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
          },
          {
            tooltip: "quality filtering with fastp",
            scriptName: "quality_filtering_paired_end_fastp.sh",
            imageName: "pipecraft/fastp:0.23.2",
            serviceName: "fastp",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "trim_polyG",
                value: 12,
                disabled: "never",
                tooltip:
                  "specify the minimum length for polyG tail trimming. Useful for Illumina NextSeq/NovaSeq data, where read tails contain multiple Gs, which means no signal in the Illumina two-color systems (empty field = disable_trim_poly_g)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (=> --disable_trim_poly_g)",
                ],
              },
              {
                name: "trim_polyX",
                value: null,
                disabled: "never",
                tooltip:
                  "specify the minimum length to trim polyX (i.e. multiple A, T or Cs) in the read tail (empty field = no action taken)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (= no action)",
                ],
              },
              {
                name: "max_length",
                value: 0,
                disabled: "never",
                tooltip:
                  "reads longer than 'max length' will be discarded, default 0 means no limitation",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "trunc_length",
                value: 0,
                disabled: "never",
                tooltip:
                  "truncate sequences to specified length. Shorter sequences are discarded; thus check that 'min length' setting is lower than 'trunc length'",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "aver_qual",
                value: 0,
                disabled: "never",
                tooltip:
                  "if one read's average quality score <'aver_qual', then this read/pair is discarded. Default 0 means no requirement",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "low_complexity_filter",
                value: null,
                disabled: "never",
                tooltip:
                  "enable low complexity filter and specify the threshold for low complexity filter. The complexity is defined as the percentage of base that is different from its next base (base[i] != base[i+1]). E.g. vaule 30 means then 30% complexity is required. Not specified = filter not applied",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v == "") ||
                    "ERROR: specify values >= 1 or leave it empty (=no action taken)",
                ],
              },
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
            Inputs: [
              {
                name: "window_size",
                value: 4,
                disabled: "never",
                tooltip: "the window size for calculating mean quality",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v <= 1000) ||
                    "ERROR: specify values in range 1-1000",
                ],
              },
              {
                name: "required_qual",
                value: 27,
                disabled: "never",
                tooltip:
                  "the mean quality requirement per sliding window (window_size)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 1) | (v <= 36) ||
                    "ERROR: specify values in range 1-36",
                ],
              },
              {
                name: "min_qual",
                value: 15,
                disabled: "never",
                tooltip:
                  "the quality value that a base is qualified. Default 15 means phred quality >=Q15 is qualified",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_qual_thresh",
                value: 40,
                disabled: "never",
                tooltip:
                  "how many percents of bases are allowed to be unqualified (0-100)",
                type: "numeric",
                rules: [
                  (v) =>
                    (v >= 0) | (v <= 100) ||
                    "ERROR: specify values in range 0-100",
                ],
              },
              {
                name: "maxNs",
                value: 0,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of Ns",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "min_length",
                value: 32,
                disabled: "never",
                tooltip:
                  "minimum length of the filtered output sequence. Shorter sequences are discarded",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
          },
          {
            tooltip: "quality filtering with DADA2 'filterAndTrim' function",
            scriptName: "quality_filtering_paired_end_dada2.sh",
            imageName: "pipecraft/dada2:1.20",
            serviceName: "DADA2",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "truncQ",
                value: 2,
                disabled: "never",
                tooltip:
                  "truncate reads at the first instance of a quality score less than or equal to truncQ",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "truncLen",
                value: 0,
                disabled: "never",
                tooltip:
                  "truncate reads after truncLen bases (applies to R1 reads when working with paired-end data). Reads shorter than this are discarded. Explore quality profiles (with QualityCheck module) and see whether poor quality ends needs to be truncated",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "truncLen_R2",
                value: 0,
                disabled: "single_end",
                tooltip:
                  "applies only for paired-end data. Truncate R2 reads after truncLen bases. Reads shorter than this are discarded. Explore quality profiles (with QualityCheck module) and see whether poor quality ends needs to be truncated",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "maxLen",
                value: 9999,
                disabled: "never",
                tooltip:
                  "remove reads with length greater than maxLen. maxLen is enforced on the raw reads. In dada2, the default = Inf, but here set as 9999",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "minQ",
                value: 0,
                disabled: "never",
                tooltip:
                  "after truncation, reads contain a quality score below minQ will be discarded",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "matchIDs",
                value: true,
                disabled: "single_end",
                tooltip:
                  "applies only for paired-end data. If TRUE, then double-checking (with seqkit pair) that only paired reads that share ids are outputted",
                type: "bool",
              },
            ],
            Inputs: [
              {
                name: "read_R1",
                value: ["\\.R1"],
                disabled: "single_end",
                tooltip:
                  "applies only for paired-end data. Identifyer string that is common for all R1 reads (e.g. when all R1 files have '.R1' string, then enter '\\.R1'. Note that backslash is only needed to escape dot regex; e.g. when all R1 files have '_R1' string, then enter '_R1'.)'",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "read_R2",
                value: ["\\.R2"],
                disabled: "single_end",
                tooltip:
                  "applies only for paired-end data. Identifyer string that is common for all R2 reads (e.g. when all R2 files have '.R2' string, then enter '\\.R2'. Note that backslash is only needed to escape dot regex; e.g. when all R2 files have '_R1' string, then enter '_R2'.)",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "samp_ID",
                value: ["\\."],
                disabled: "single_end",
                tooltip:
                  "applies only for paired-end data. Identifyer string that separates the sample name from redundant charachters (e.g. file name = sample1.R1.fastq, then '\\.' would be the 'identifier string' (sample name = sample1)); note that backslash is only needed to escape dot regex (e.g. when file name = sample1_R1.fastq then specify as '_')",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "maxEE",
                value: 2,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of expected errors",
                type: "numeric",
                rules: [(v) => v >= 0.1 || "ERROR: specify values >= 0.1"],
              },
              {
                name: "maxN",
                value: 0,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of N’s (ambiguous bases)",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "minLen",
                value: 20,
                disabled: "never",
                tooltip:
                  "remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
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
            tooltip: "assemble paired-end reads with vsearch",
            scriptName: "assemble_paired_end_data_vsearch.sh",
            imageName: "pipecraft/vsearch:2.18",
            serviceName: "vsearch",
            disabled: "single_end",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "max_diffs",
                value: 20,
                disabled: "never",
                tooltip:
                  "the maximum number of non-matching nucleotides allowed in the overlap region",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "max_Ns",
                value: 0,
                disabled: "never",
                tooltip:
                  "discard sequences with more than the specified number of N’s",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "max_len",
                value: 600,
                disabled: "never",
                tooltip: "maximum length of the merged sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
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
                  "maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
            ],
            Inputs: [
              {
                name: "read_R1",
                value: ["\\.R1"],
                disabled: "single_end",
                tooltip:
                  "identifyer string that is common for all R1 reads (e.g. when all R1 files have '.R1' string, then enter '\\.R1'. Note that backslash is only needed to escape dot regex; e.g. when all R1 files have '_R1' string, then enter '_R1'.)",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "min_overlap",
                value: 12,
                disabled: "never",
                tooltip: "minimum overlap between the merged reads",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_lenght",
                value: 32,
                disabled: "never",
                tooltip: "minimum length of the merged sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "allow_merge_stagger",
                value: true,
                disabled: "never",
                tooltip:
                  "allow to merge staggered read pairs. Staggered pairs are pairs where the 3' end of the reverse read has an overhang to the left of the 5' end of the forward read. This situation can occur when a very short fragment is sequenced",
                type: "bool",
              },
              {
                name: "include_only_R1",
                value: false,
                disabled: "never",
                tooltip:
                  "Include unassembled R1 reads to the set of assembled reads per sample. This may be relevant when working with e.g. ITS2 sequences, because the ITS2 region in some taxa is too long for assembly, therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences for these taxa will be represented in the final output",
                type: "bool",
              },
            ],
          },
          {
            tooltip:
              "assemble paired-end reads with DADA2 'mergePairs' function. This step performs also dada denoising! Note that only FASTA is outputted!",
            scriptName: "assemble_paired_end_data_dada2.sh",
            imageName: "pipecraft/dada2:1.20",
            serviceName: "DADA2_denoise_and_merge",
            selected: false,
            disabled: "single_end",
            showExtra: false,
            extraInputs: [
              {
                name: "pool",
                items: ["FALSE", "TRUE", "psuedo"],
                value: "FALSE",
                disabled: "never",
                tooltip:
                  "Denoising option. If pool = TRUE, the algorithm will pool together all samples prior to sample inference. Pooling improves the detection of rare variants, but is computationally more expensive. If pool = 'pseudo', the algorithm will perform pseudo-pooling between individually processed samples. This argument has no effect if only 1 sample is provided, and pool does not affect error rates, which are always estimated from pooled observations across samples",
                type: "select",
              },
              {
                name: "selfConsist",
                disabled: "never",
                value: false,
                tooltip:
                  "Denoising option. If selfConsist = TRUE, the algorithm will alternate between sample inference and error rate estimation until convergence",
                type: "bool",
              },
              {
                name: "qualityType",
                items: ["Auto", "FastqQuality"],
                value: "Auto",
                disabled: "never",
                tooltip:
                  "Auto means to attempt to auto-detect the fastq quality encoding. This may fail for PacBio files with uniformly high quality scores, in which case use 'FastqQuality'",
                type: "select",
              },
            ],
            Inputs: [
              {
                name: "read_R1",
                value: ["\\.R1"],
                disabled: "single_end",
                tooltip:
                  "identifyer string that is common for all R1 reads (e.g. when all R1 files have '.R1' string, then enter '\\.R1'. Note that backslash is only needed to escape dot regex; e.g. when all R1 files have '_R1' string, then enter '_R1'.)",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "read_R2",
                value: ["\\.R2"],
                disabled: "single_end",
                tooltip:
                  "identifyer string that is common for all R2 reads (e.g. when all R2 files have '.R2' string, then enter '\\.R2'. Note that backslash is only needed to escape dot regex; e.g. when all R2 files have '_R1' string, then enter '_R2'.)",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "samp_ID",
                value: ["\\."],
                disabled: "never",
                tooltip:
                  "identifyer string that separates the sample name from redundant charachters (e.g. file name = sample1.R1.fastq, then '\\.' would be the 'identifier string' (sample name = sample1)); note that backslash is only needed to escape dot regex (e.g. when file name = sample1_R1.fastq then specify as '_')",
                type: "chip",
                rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
              },
              {
                name: "minOverlap",
                value: 12,
                disabled: "never",
                tooltip:
                  "the minimum length of the overlap required for merging the forward and reverse reads",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "maxMismatch",
                value: 0,
                disabled: "never",
                tooltip: "the maximum mismatches allowed in the overlap region",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "trimOverhang",
                value: false,
                disabled: "never",
                tooltip:
                  "if TRUE, overhangs in the alignment between the forwards and reverse read are trimmed off. Overhangs are when the reverse read extends past the start of the forward read, and vice-versa, as can happen when reads are longer than the amplicon and read into the other-direction primer region",
                type: "bool",
              },
              {
                name: "justConcatenate",
                value: false,
                disabled: "never",
                tooltip:
                  "if TRUE, the forward and reverse-complemented reverse read are concatenated rather than merged, with a NNNNNNNNNN (10 Ns) spacer inserted between them",
                type: "bool",
              },
            ],
          },
        ],
      },
      {
        stepName: "chimera filtering",
        disabled: "never",
        services: [
          {
            tooltip:
              "tick the checkbox to filter chimeras with vsearch. Run only on single-end or assembled paired-end data",
            scriptName: "chimera_filtering_vsearch.sh",
            imageName: "pipecraft/vsearch:2.18",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip: "Number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "abundance_skew",
                value: 2,
                disabled: "never",
                tooltip:
                  "The abundance skew is used to distinguish in a threeway alignment which sequence is the chimera and which are the parents. The assumption is that chimeras appear later in the PCR amplification process and are therefore less abundant than their parents. The default value is 2.0, which means that the parents should be at least 2 times more abundant than their chimera. Any positive value equal or greater than 1.0 can be used",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_h",
                value: 0.28,
                disabled: "never",
                tooltip:
                  "Minimum score (h). Increasing this value tends to reduce the number of false positives and to decrease sensitivity. Values ranging from 0.0 to 1.0 included are accepted",
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
                  "Identity percentage when performing 'pre-clustering' with --cluster_size for denovo chimera filtering with --uchime_denovo",
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
                  "Minimum amount of a unique sequences in a fasta file. If value = 1, then no sequences are discarded after dereplication; if value = 2, then sequences, which are represented only once in a given file are discarded; and so on",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "denovo",
                value: true,
                disabled: "never",
                tooltip:
                  "Perform denovo chimera filtering with --uchime_denovo",
                type: "bool",
              },
              {
                name: "reference_based",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "Perform reference database based chimera filtering with --uchime_ref. If denovo = TRUE, then reference based chimera filtering will be performed after denovo",
                type: "boolfile",
              },
            ],
          },
        ],
      },
      {
        stepName: "ITS Extractor",
        disabled: "never",
        services: [
          {
            tooltip:
              "if data set consists of ITS sequences; identify and extract the ITS regions using ITSx",
            scriptName: "ITS_extractor.sh",
            imageName: "pipecraft/itsx:1.1.3",
            serviceName: "itsx",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "e_value",
                value: (0.01).toExponential(),
                disabled: "never",
                tooltip:
                  "domain E-value cutoff a sequence must obtain in the HMMER-based step to be included in the output. Here, the defaul 1e-2 = 0.01 (more relaxed compared with the default ITSx [1e-5])",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify only values > 0"],
              },
              {
                name: "scores",
                value: 0,
                disabled: "never",
                tooltip:
                  "domain score cutoff that a sequence must obtain in the HMMER-based step to be included in the output. Leave as default if unsure how to set",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify only values > 0"],
              },
              {
                name: "domains",
                value: 2,
                disabled: "never",
                tooltip:
                  "the minimum number of domains (different HMM gene profiles) that must match a sequence for it to be included in the output (detected as an ITS sequence). Setting the value lower than two will increase the number of false positives, while increasing it above two will decrease ITSx detection abilities on fragmentary data",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "complement",
                value: true,
                disabled: "never",
                tooltip:
                  "if TRUE, then ITSx checks also reverse complementary strands for matches to HMM-profiles",
                type: "bool",
              },
              {
                name: "only_full",
                value: false,
                disabled: "never",
                tooltip:
                  "if TRUE, the output is limited to full-length ITS1 and ITS2 regions only",
                type: "bool",
              },
              {
                name: "truncate",
                value: true,
                disabled: "never",
                tooltip:
                  "if TRUE, ITSx removes ends of ITS sequences if they are outside of the ITS region. If off, the whole input sequence is saved when ITS region is detected",
                type: "bool",
              },
            ],
            Inputs: [
              {
                name: "organisms",
                items: [
                  "all",
                  "alveolata",
                  "bryophyta",
                  "bacillariophyta",
                  "amoebozoa",
                  "euglenozoa",
                  "fungi",
                  "chlorophyta",
                  "rhodophyta",
                  "phaeophyceae",
                  "marchantiophyta",
                  "metazoa",
                  "oomycota",
                  "haptophyceae",
                  "raphidophyceae",
                  "rhizaria",
                  "synurophyceae",
                  "tracheophyta",
                  "eustigmatophyceae",
                  "apusozoa",
                  "parabasalia",
                ],
                value: ["fungi"],
                disabled: "never",
                tooltip:
                  "set of profiles to use for the search. Can be used to restrict the search to only a few organism groups types to save time, if one or more of the origins are not relevant to the dataset under study",
                type: "combobox",
              },
              {
                name: "regions",
                items: ["all", "SSU", "ITS1", "5.8S", "ITS2", "LSU"],
                value: ["all"],
                disabled: "never",
                tooltip:
                  "ITS regions to output (note that 'all' will output also full ITS region [ITS1-5.8S-ITS2])",
                type: "combobox",
              },
              {
                name: "partial",
                value: 50,
                disabled: "never",
                tooltip:
                  "if larger than 0, ITSx will save additional FASTA-files for full and partial ITS sequences longer than the specified cutoff value. If his setting is left to 0 (zero), it means OFF",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify only values >= 0"],
              },
            ],
          },
        ],
      },
      {
        stepName: "clustering",
        disabled: "never",
        services: [
          {
            scriptName: "clustering_vsearch.sh",
            tooltip: "tick the checkbox to cluster reads with vsearch",
            imageName: "pipecraft/vsearch:2.18",
            serviceName: "vsearch",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "similarity_type",
                items: ["0", "1", "2", "3", "4"],
                value: "2",
                disabled: "never",
                tooltip: "pairwise sequence identity definition (--iddef)",
                type: "select",
              },
              {
                name: "sequence_sorting",
                items: ["cluster_fast", "cluster_size", "cluster_smallmem"],
                value: "cluster_size",
                disabled: "never",
                tooltip:
                  'size = sort the sequences by decreasing abundance; "length" = sort the sequences by decreasing length (--cluster_fast); "no" = do not sort sequences (--cluster_smallmem --usersort)',
                type: "select",
              },
              {
                name: "centroid_type",
                items: ["similarity", "abundance"],
                value: "similarity",
                disabled: "never",
                tooltip:
                  '"similarity" = assign representative sequence to the closest (most similar) centroid (distance-based greedy clustering); "abundance" = assign representative sequence to the most abundant centroid (abundance-based greedy clustering; --sizeorder), --maxaccepts should be > 1',
                type: "select",
              },
              {
                name: "max_hits",
                value: 1,
                disabled: "never",
                tooltip:
                  "maximum number of hits to accept before stopping the search (should be > 1 for abundance-based selection of centroids [centroid type])",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
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
                name: "output_UC",
                value: false,
                disabled: "never",
                tooltip:
                  "output clustering results in tab-separated UCLAST-like format",
                type: "bool",
              },
            ],
            Inputs: [
              {
                name: "OTU_type",
                items: ["centroid", "consensus"],
                disabled: "never",
                tooltip:
                  '"centroid" = output centroid sequences; "consensus" = output consensus sequences',
                value: "centroid",
                type: "select",
              },
              {
                name: "similarity_threshold",
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
                name: "min_OTU_size",
                value: 2,
                disabled: "never",
                tooltip:
                  "minimum read count per output OTU (e.g., if value = 2, then singleton OTUs will be discarded [OTUs with only one sequence])",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
          },
        ],
      },
      {
        stepName: "postclustering",
        disabled: "never",
        services: [
          {
            tooltip: "postclustering with LULU algorithm",
            scriptName: "lulu.sh",
            imageName: "pipecraft/dada2:1.20",
            serviceName: "LULU",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "match_list_soft",
                items: ["vsearch", "BLAST"],
                value: "vsearch",
                disabled: "never",
                tooltip:
                  "use either 'blastn' or 'vsearch' to generate match list for LULU. Default is 'vsearch' (much faster)",
                type: "select",
              },
              {
                name: "vsearch_similarity_type",
                items: ["0", "1", "2", "3", "4"],
                value: "2",
                disabled: "never",
                tooltip:
                  "applies only when 'vsearch' is used as 'match_list_soft'. Pairwise sequence identity definition (--iddef)",
                type: "select",
              },
              {
                name: "perc_identity",
                value: 84,
                disabled: "never",
                tooltip:
                  "percent identity cutoff for match list. Excluding pairwise comparisons with lower sequence identity percentage than specified threshold",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "coverage_perc",
                value: 80,
                disabled: "never",
                tooltip:
                  "percent query coverage per hit. Excluding pairwise comparisons with lower sequence coverage than specified threshold",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "strands",
                items: ["plus", "both"],
                value: "both",
                disabled: "never",
                tooltip:
                  "query strand to search against database. Both = search also reverse complement",
                type: "select",
              },
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip:
                  "number of cores to use for generating match list for LULU",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
            Inputs: [
              {
                name: "table",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select OTU/ASV table. If no file is selected, then PipeCraft will look OTU_table.txt or ASV_table.txt in the working directory",
                type: "boolfile",
              },
              {
                name: "rep_seqs",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select fasta formatted sequence file containing your OTU/ASV reads",
                type: "boolfile",
              },
              {
                name: "min_ratio_type",
                items: ["min", "avg"],
                value: "min",
                disabled: "never",
                tooltip:
                  "sets whether a potential error must have lower abundance than the parent in all samples 'min' (default), or if an error just needs to have lower abundance on average 'avg'",
                type: "select",
              },
              {
                name: "min_ratio",
                value: 1,
                disabled: "never",
                tooltip:
                  "default = 1. Sets the minimim abundance ratio between a potential error and a potential parent to be identified as an error",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_match",
                value: 95,
                disabled: "never",
                tooltip:
                  "specify minimum threshold of sequence similarity for considering any OTU as an error of another",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "min_rel_cooccurence",
                value: 0.95,
                disabled: "never",
                tooltip:
                  "minimum co-occurrence rate. Default = 0.95 (meaning that 1 in 20 samples are allowed to have no parent presence)",
                max: 1,
                min: 0,
                step: 0.01,
                type: "slide",
              },
            ],
          },
        ],
      },
      {
        stepName: "assign taxonomy",
        disabled: "never",
        services: [
          {
            tooltip: "assign taxonomy with BLAST against selected database",
            scriptName: "taxonomy_BLAST_xml.sh",
            imageName: "pipecraft/blast:2.12",
            serviceName: "BLAST",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "e_value",
                value: 10,
                disabled: "never",
                tooltip:
                  "a parameter that describes the number of hits one can expect to see by chance when searching a database of a particular size. The lower the e-value the more 'significant' the match is",
                type: "numeric",
                default: 10,
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "word_size",
                value: 11,
                disabled: "never",
                tooltip:
                  "the size of the initial word that must be matched between the database and the query sequence",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "reward",
                value: 2,
                disabled: "never",
                tooltip: "reward for a match",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "penalty",
                value: -3,
                disabled: "never",
                tooltip: "penalty for a mismatch",
                type: "numeric",
                rules: [(v) => v <= 0 || "ERROR: specify values <= 0"],
              },
              {
                name: "gap_open",
                value: 5,
                disabled: "never",
                tooltip: "cost to open a gap",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "gap_extend",
                value: 2,
                disabled: "never",
                tooltip: "cost to extend a gap",
                type: "numeric",
                // rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip: "number of cores to use",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
            Inputs: [
              {
                name: "database_file",
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "database file (may be fasta formated - automatically will convert to BLAST database format)",
                type: "file",
              },
              {
                name: "task",
                items: ["blastn", "megablast"],
                value: "blastn",
                disabled: "never",
                tooltip: "task (blastn or megablast)",
                type: "select",
              },
              {
                name: "strands",
                items: ["plus", "both"],
                value: "both",
                disabled: "never",
                tooltip:
                  "query strand to search against database. Both = search also reverse complement",
                type: "select",
              },
            ],
          },
          {
            tooltip:
              "assign taxonomy with DADA2 'assignTaxonomy' function against the selected database",
            scriptName: "taxonomy_dada2.sh",
            imageName: "pipecraft/dada2:1.20",
            serviceName: "DADA2 classifier",
            disabled: "never",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "dada2_database",
                btnName: "select fasta",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select a reference database fasta file for taxonomy annotation",
                type: "file",
              },
              {
                name: "download databases",
                value: "https://benjjneb.github.io/dada2/training.html",
                disabled: "never",
                type: "link",
                tooltip: "link to download DADA2-formatted reference databases",
              },
              {
                name: "minBoot",
                value: 50,
                disabled: "never",
                tooltip:
                  "the minimum bootstrap confidence for assigning a taxonomic level",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "tryRC",
                value: false,
                disabled: "never",
                tooltip:
                  "the reverse-complement of each sequences will be used for classification if it is a better match to the reference sequences than the forward sequence",
                type: "bool",
              },
            ],
          },
        ],
      },
      {
        stepName: "postprocessing",
        disabled: "never",
        services: [
          {
            tooltip: "postclustering with LULU algorithm",
            scriptName: "lulu.sh",
            imageName: "pipecraft/dada2:1.20",
            serviceName: "LULU",
            selected: false,
            showExtra: false,
            extraInputs: [
              {
                name: "match_list_soft",
                items: ["vsearch", "BLAST"],
                value: "vsearch",
                disabled: "never",
                tooltip:
                  "use either 'blastn' or 'vsearch' to generate match list for LULU. Default is 'vsearch' (much faster)",
                type: "select",
              },
              {
                name: "vsearch_similarity_type",
                items: ["0", "1", "2", "3", "4"],
                value: "2",
                disabled: "never",
                tooltip:
                  "applies only when 'vsearch' is used as 'match_list_soft'. Pairwise sequence identity definition (--iddef)",
                type: "select",
              },
              {
                name: "perc_identity",
                value: 84,
                disabled: "never",
                tooltip:
                  "percent identity cutoff for match list. Excluding pairwise comparisons with lower sequence identity percentage than specified threshold",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "coverage_perc",
                value: 80,
                disabled: "never",
                tooltip:
                  "percent query coverage per hit. Excluding pairwise comparisons with lower sequence coverage than specified threshold",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "strands",
                items: ["plus", "both"],
                value: "both",
                disabled: "never",
                tooltip:
                  "query strand to search against database. Both = search also reverse complement",
                type: "select",
              },
              {
                name: "cores",
                value: 4,
                disabled: "never",
                tooltip:
                  "number of cores to use for generating match list for LULU",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
            ],
            Inputs: [
              {
                name: "table",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select OTU/ASV table. If no file is selected, then PipeCraft will look OTU_table.txt or ASV_table.txt in the working directory",
                type: "boolfile",
              },
              {
                name: "rep_seqs",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select fasta formatted sequence file containing your OTU/ASV reads",
                type: "boolfile",
              },
              {
                name: "min_ratio_type",
                items: ["min", "avg"],
                value: "min",
                disabled: "never",
                tooltip:
                  "sets whether a potential error must have lower abundance than the parent in all samples 'min' (default), or if an error just needs to have lower abundance on average 'avg'",
                type: "select",
              },
              {
                name: "min_ratio",
                value: 1,
                disabled: "never",
                tooltip:
                  "default = 1. Sets the minimim abundance ratio between a potential error and a potential parent to be identified as an error",
                type: "numeric",
                rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
              },
              {
                name: "min_match",
                value: 95,
                disabled: "never",
                tooltip:
                  "default = 95%. Specify minimum threshold of sequence similarity for considering any OTU as an error of another",
                type: "numeric",
                rules: [
                  (v) => v >= 1 || "ERROR: specify values >= 1",
                  (v) => v <= 100 || "ERROR: specify values <= 100",
                ],
              },
              {
                name: "min_rel_cooccurence",
                value: 0.95,
                disabled: "never",
                tooltip:
                  "minimum co-occurrence rate. Default = 0.95 (meaning that 1 in 20 samples are allowed to have no parent presence)",
                max: 1,
                min: 0,
                step: 0.01,
                type: "slide",
              },
            ],
          },
          {
            tooltip:
              "DEICODE (Robust Aitchison PCA on sparse compositional metabarcoding data)",
            scriptName: "DEICODE.sh",
            imageName: "pipecraft/deicode:0.2.4",
            serviceName: "DEICODE",
            selected: false,
            showExtra: false,
            extraInputs: [],
            Inputs: [
              {
                name: "table",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select OTU/ASV table. If no file is selected, then PipeCraft will look OTU_table.txt or ASV_table.txt in the working directory",
                type: "boolfile",
              },
              {
                name: "subset_IDs",
                active: false,
                btnName: "select file",
                value: "undefined",
                disabled: "never",
                tooltip:
                  "select list of OTU/ASV IDs for analysing a subset from the full table",
                type: "boolfile",
              },
              {
                name: "min_otu_reads",
                value: 10,
                disabled: "never",
                tooltip:
                  "cutoff for reads per OTU/ASV. OTUs/ASVs with lower reads then specified cutoff will be excluded from the analysis",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
              {
                name: "min_sample_reads",
                value: 500,
                disabled: "never",
                tooltip:
                  "cutoff for reads per sample. Samples with lower reads then specified cutoff will be excluded from the analysis",
                type: "numeric",
                rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
              },
            ],
          },
        ],
      },
    ],
    OTUs_workflow: [
      {
        tooltip:
          "demultiplex data to per-sample files based on specified index file",
        scriptName: "demux_paired_end_data.sh",
        imageName: "pipecraft/cutadapt:3.5",
        serviceName: "demultiplex",
        disabled: "demultiplexed",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "min_seq_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the output sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "do not allow insertions or deletions in the index sequence",
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
              "select your fasta formatted indexes file for demultiplexing, where fasta headers are sample names, and sequences are sample specific index or index combination",
            type: "file",
          },
          {
            name: "index_file_example",
            value:
              "https://pipecraft2-manual.readthedocs.io/en/stable/user_guide.html#indexes-file-example-fasta-formatted",
            disabled: "never",
            type: "link",
            tooltip: "link to PipeCraft manual page, index file examples",
          },
          {
            name: "index_mismatch",
            value: 0,
            disabled: "never",
            tooltip: "allowed mismatches during the index search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "overlap",
            value: 8,
            disabled: "never",
            tooltip:
              "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
        ],
      },
      {
        tooltip: "reorient reads based on specified primer sequences",
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
            value: 1,
            disabled: "never",
            tooltip: "allowed mismatches in the primer search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "specify forward primer (5'-3'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        tooltip: "remove primers sequences from the reads",
        scriptName: "cut_primers_paired_end_reads.sh",
        imageName: "pipecraft/cutadapt:3.5",
        serviceName: "cut primers",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip:
              "number of cores to use. For paired-end data in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "min_seq_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the output sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "do not allow insertions or deletions is primer search. Mismatches are the only type of errors accounted in the error rate parameter",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "specify forward primer (5'-3'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "mismatches",
            value: 1,
            disabled: "never",
            tooltip: "allowed mismatches in the primer search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "min_overlap",
            value: 21,
            disabled: "never",
            tooltip:
              "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified mismatch error range)",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            disabled: "never",
            tooltip:
              "'keep_all' keeps the sequences where at least one primer was found (fwd or rev); recommended when cutting primers from paired-end data (unassembled), where individual R1 or R2 read lenghts are shorther than the expected amplicon length. 'keep_only_linked' = keep sequences if primers are found in both ends (fwd…rev); discards the read if both primers were not found in this read; maybe useful for single-end data",
            type: "select",
          },
          {
            name: "pair_filter",
            items: ["both", "any"],
            value: "both",
            disabled: "never",
            tooltip:
              "applies only for paired-end data. 'both', means that a read is discarded only if both, corresponding R1 and R2, reads  do not contain primer strings (i.e. a read is kept if R1 contains primer string, but no primer string found in R2 read). Option 'any' discards the read if primers are not found in both, R1 and R2 reads",
            type: "select",
          },
        ],
      },
      {
        tooltip: "assemble paired-end reads with vsearch",
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
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "max_Ns",
            value: 0,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of Ns",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "max_len",
            value: 600,
            disabled: "never",
            tooltip: "maximum length of the merged sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
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
              "maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
        ],
        Inputs: [
          {
            name: "min_overlap",
            value: 12,
            disabled: "never",
            tooltip: "minimum overlap between the merged reads",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "min_lenght",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the merged sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "allow_merge_stagger",
            value: true,
            disabled: "never",
            tooltip:
              "allow to merge staggered read pairs. Staggered pairs are pairs where the 3' end of the reverse read has an overhang to the left of the 5' end of the forward read. This situation can occur when a very short fragment is sequenced",
            type: "bool",
          },
          {
            name: "include_only_R1",
            value: false,
            disabled: "never",
            tooltip:
              "include unassembled R1 reads to the set of assembled reads per sample. This may be relevant when working with e.g. ITS2 sequences, because the ITS2 region in some taxa is too long for assembly, therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences for these taxa will be represented in the final output",
            type: "bool",
          },
        ],
      },
      {
        tooltip: "quality filtering with vsearch",
        scriptName: "quality_filtering_paired_end_vsearch.sh",
        imageName: "pipecraft/vsearch:2.18",
        serviceName: "quality filtering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "max_length",
            value: null,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of bases. Note that if 'trunc length' setting is specified, then 'max length' SHOULD NOT be lower than 'trunc lenght' (otherwise all reads are discared)",
            type: "numeric",
            rules: [
              (v) =>
                (v >= 1) | (v == "") ||
                "ERROR: specify values >= 1 or leave it empty (=no action taken)",
            ],
          },
          {
            name: "qmax",
            value: 41,
            disabled: "never",
            tooltip:
              "specify the maximum quality score accepted when reading FASTQ files. The default is 41, which is usual for recent Sanger/Illumina 1.8+ files. For PacBio data use 93",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "qmin",
            value: 0,
            disabled: "never",
            tooltip:
              "the minimum quality score accepted for FASTQ files. The default is 0, which is usual for recent Sanger/Illumina 1.8+ files. Older formats may use scores between -5 and 2",
            type: "numeric",
            rules: [(v) => v >= -5 || "ERROR: specify values >= -5"],
          },
          {
            name: "maxee_rate",
            value: null,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of expected errors per base",
            type: "numeric",
            rules: [
              (v) =>
                (v >= 0.1) | (v == "") ||
                "ERROR: specify values >= 0.1 or leave it empty (=no action taken)",
            ],
          },
          // {
          //   name: "min_size",
          //   value: 1,
          //   disabled: "never",
          //   tooltip:
          //     "discard sequences with an abundance lower than the specified value",
          //   type: "numeric",
          //   rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          // },
        ],
        Inputs: [
          {
            name: "maxee",
            value: 1,
            disabled: "never",
            tooltip:
              "maximum number of expected errors per sequence. Sequences with higher error rates will be discarded",
            type: "numeric",
            rules: [(v) => v >= 0.1 || "ERROR: specify values >= 0.1"],
          },
          {
            name: "maxNs",
            value: 0,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of Ns",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "min_length",
            value: 32,
            disabled: "never",
            tooltip:
              "minimum length of the filtered output sequence. Note that if 'trunc length' setting is specified, then 'min length' SHOULD BE lower than 'trunc lenght' (otherwise all reads are discared)",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "trunc_length",
            value: null,
            disabled: "never",
            tooltip:
              "truncate sequences to the specified length. Shorter sequences are discarded; thus if specified, check that 'min length' setting is lower than 'trunc length' ('min lenght' therefore has basically no effect)",
            type: "numeric",
            rules: [
              (v) =>
                (v >= 5) | (v == "") ||
                "ERROR: specify values >= 5 or leave it empty (=no action taken)",
            ],
          },
        ],
      },
      {
        tooltip:
          "chimera filtering with vsearch. Untick the checkbox to skip this step",
        scriptName: "chimera_filtering_vsearch.sh",
        imageName: "pipecraft/vsearch:2.18",
        serviceName: "chimera filtering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "Number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "abundance_skew",
            value: 2,
            disabled: "never",
            tooltip:
              "the abundance skew is used to distinguish in a threeway alignment which sequence is the chimera and which are the parents. The assumption is that chimeras appear later in the PCR amplification process and are therefore less abundant than their parents. The default value is 2.0, which means that the parents should be at least 2 times more abundant than their chimera. Any positive value equal or greater than 1.0 can be used",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "min_h",
            value: 0.28,
            disabled: "never",
            tooltip:
              "minimum score (h). Increasing this value tends to reduce the number of false positives and to decrease sensitivity. Values ranging from 0.0 to 1.0 included are accepted",
            max: 1,
            min: 0,
            step: 0.01,
            type: "slide",
          },
        ],
        Inputs: [
          {
            name: "pre_cluster",
            value: 0.97,
            disabled: "never",
            tooltip:
              "identity percentage when performing 'pre-clustering' with --cluster_size for denovo chimera filtering with --uchime_denovo",
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
              "minimum amount of a unique sequences in a fasta file. If value = 1, then no sequences are discarded after dereplication; if value = 2, then sequences, which are represented only once in a given file are discarded; and so on",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "denovo",
            value: true,
            disabled: "never",
            tooltip:
              "if TRUE, then perform denovo chimera filtering with --uchime_denovo",
            type: "bool",
          },
          {
            name: "reference_based",
            active: false,
            btnName: "select file",
            value: "undefined",
            disabled: "never",
            tooltip:
              "perform reference database based chimera filtering with --uchime_ref. If denovo = TRUE, then reference based chimera filtering will be performed after denovo",
            type: "boolfile",
          },
        ],
      },
      {
        tooltip:
          "if data set consists of ITS sequences; identify and extract the ITS regions using ITSx. NOTE THAT 'CLUSTERING' AND 'ASSIGN TAXONOMY' WILL BE DISABLED AT THIS STAGE if 'ITS EXTRACTOR' IS SELECTED; because ITSx outputs multiple directories for different ITS sub-regions; select appropriate ITSx output folder for CLUSTERING after the process is finished",
        scriptName: "ITS_extractor.sh",
        imageName: "pipecraft/itsx:1.1.3",
        serviceName: "itsx",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "e_value",
            value: (0.01).toExponential(),
            disabled: "never",
            tooltip:
              "domain E-value cutoff a sequence must obtain in the HMMER-based step to be included in the output. Here, the defaul 1e-2 = 0.01 (more relaxed compared with the default ITSx [1e-5])",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "scores",
            value: 0,
            disabled: "never",
            tooltip:
              "domain score cutoff that a sequence must obtain in the HMMER-based step to be included in the output",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "domains",
            value: 2,
            disabled: "never",
            tooltip:
              "the minimum number of domains (different HMM gene profiles) that must match a sequence for it to be included in the output (detected as an ITS sequence). Setting the value lower than two will increase the number of false positives, while increasing it above two will decrease ITSx detection abilities on fragmentary data",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "complement",
            value: true,
            disabled: "never",
            tooltip:
              "if TRUE, ITSx checks both DNA strands for matches to HMM-profiles",
            type: "bool",
          },
          {
            name: "only_full",
            value: false,
            disabled: "never",
            tooltip:
              "If TRUE, the output is limited to full-length ITS1 and ITS2 regions only",
            type: "bool",
          },
          {
            name: "truncate",
            value: true,
            disabled: "never",
            tooltip:
              "if TRUE, ITSx removes ends of ITS sequences if they are outside of the ITS region. If off, the whole input sequence is saved when ITS region is detected",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "organisms",
            items: [
              "all",
              "alveolata",
              "bryophyta",
              "bacillariophyta",
              "amoebozoa",
              "euglenozoa",
              "fungi",
              "chlorophyta",
              "rhodophyta",
              "phaeophyceae",
              "marchantiophyta",
              "metazoa",
              "oomycota",
              "haptophyceae",
              "raphidophyceae",
              "rhizaria",
              "synurophyceae",
              "tracheophyta",
              "eustigmatophyceae",
              "apusozoa",
              "parabasalia",
            ],
            value: ["fungi"],
            disabled: "never",
            tooltip:
              "set of profiles to use for the search. Can be used to restrict the search to only a few organism groups types to save time, if one or more of the origins are not relevant to the dataset under study",
            type: "combobox",
          },
          {
            name: "regions",
            items: ["all", "SSU", "ITS1", "5.8S", "ITS2", "LSU"],
            value: ["all"],
            disabled: "never",
            tooltip:
              "ITS regions to output (note that 'all' will output also full ITS region [ITS1-5.8S-ITS2])",
            type: "combobox",
          },
          {
            name: "partial",
            value: 50,
            disabled: "never",
            tooltip:
              "if larger than 0, ITSx will save additional FASTA-files for full and partial ITS sequences longer than the specified cutoff value. If his setting is left to 0 (zero), it means OFF",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
        ],
      },
      {
        tooltip: "cluster reads to OTUs with vsearch",
        scriptName: "clustering_vsearch.sh",
        imageName: "pipecraft/vsearch:2.18",
        serviceName: "clustering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [
          {
            name: "similarity_type",
            items: ["0", "1", "2", "3", "4"],
            value: "2",
            disabled: "never",
            tooltip: "pairwise sequence identity definition (--iddef)",
            type: "select",
          },
          {
            name: "sequence_sorting",
            items: ["cluster_fast", "cluster_size", "cluster_smallmem"],
            value: "cluster_size",
            disabled: "never",
            tooltip:
              'size = sort the sequences by decreasing abundance; "length" = sort the sequences by decreasing length (--cluster_fast); "no" = do not sort sequences (--cluster_smallmem --usersort)',
            type: "select",
          },
          {
            name: "centroid_type",
            items: ["similarity", "abundance"],
            value: "similarity",
            disabled: "never",
            tooltip:
              '"similarity" = assign representative sequence to the closest (most similar) centroid (distance-based greedy clustering); "abundance" = assign representative sequence to the most abundant centroid (abundance-based greedy clustering; --sizeorder), --maxaccepts should be > 1',
            type: "select",
          },
          {
            name: "max_hits",
            value: 1,
            disabled: "never",
            tooltip:
              "maximum number of hits to accept before stopping the search (should be > 1 for abundance-based selection of centroids [centroid type])",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
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
              'mask regions in sequences using the "dust" method, or do not mask ("none")',
            type: "select",
          },
          {
            name: "dbmask",
            items: ["dust", "none"],
            value: "dust",
            disabled: "never",
            tooltip:
              'prior the OTU table creation, mask regions in sequences using the "dust" method, or do not mask ("none")',
            type: "select",
          },
          {
            name: "output_UC",
            value: false,
            disabled: "never",
            tooltip:
              "output clustering results in tab-separated UCLAST-like format",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "OTU_type",
            items: ["centroid", "consensus"],
            disabled: "never",
            tooltip:
              '"centroid" = output centroid sequences; "consensus" = output consensus sequences',
            value: "centroid",
            type: "select",
          },
          {
            name: "similarity_threshold",
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
            name: "min_OTU_size",
            value: 2,
            disabled: "never",
            tooltip:
              "minimum read count per output OTU (e.g., if value = 2, then singleton OTUs will be discarded [OTUs with only one sequence])",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
        ],
      },
      {
        tooltip: "assign taxonomy with BLAST against selected database",
        scriptName: "taxonomy_BLAST_xml.sh",
        imageName: "pipecraft/blast:2.12",
        serviceName: "assign taxonomy",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "e_value",
            value: 10,
            disabled: "never",
            tooltip:
              "a parameter that describes the number of hits one can expect to see by chance when searching a database of a particular size. The lower the e-value the more 'significant' the match is",
            type: "numeric",
            default: 10,
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "word_size",
            value: 11,
            disabled: "never",
            tooltip:
              "the size of the initial word that must be matched between the database and the query sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "reward",
            value: 2,
            disabled: "never",
            tooltip: "reward for a match",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "penalty",
            value: -3,
            disabled: "never",
            tooltip: "penalty for a mismatch",
            type: "numeric",
            rules: [(v) => v <= 0 || "ERROR: specify values <= 0"],
          },
          {
            name: "gap_open",
            value: 5,
            disabled: "never",
            tooltip: "cost to open a gap",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "gap_extend",
            value: 2,
            disabled: "never",
            tooltip: "cost to extend a gap",
            type: "numeric",
            // rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "cores",
            value: 4,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
        ],
        Inputs: [
          {
            name: "database_file",
            btnName: "select file",
            value: "undefined",
            disabled: "never",
            tooltip:
              "database file (may be fasta formated - automatically will convert to BLAST database format)",
            type: "file",
          },
          {
            name: "task",
            items: ["blastn", "megablast"],
            value: "blastn",
            disabled: "never",
            tooltip: "task (blastn or megablast)",
            type: "select",
          },
          {
            name: "strands",
            items: ["plus", "both"],
            value: "both",
            disabled: "never",
            tooltip:
              "query strand to search against database. Both = search also reverse complement",
            type: "select",
          },
        ],
      },
    ],
    Metaworks_workflow: [
      {
        tooltip: "MetaWorks v1.11.1, ESV paired-end reads",
        scriptName: "metaworks_paired_end_ESV2.sh",
        imageName: "pipecraft/metaworks:1.11.2",
        serviceName: "metaworks_ESV",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "filename_structure",
            value: ["{sample}.R{read}"],
            disabled: "single_end",
            tooltip:
              "specify sample filename structure. mysample1.R1.fastq and mysample1.R2.fastq = {sample}.R{read}; mysample1_L001_R1_001.fastq = {sample}_L001_R{read}_001",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "quality_cutoff",
            value: 19,
            disabled: "never",
            tooltip: "phred score quality cutoff (default 19)",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "min_overlap",
            value: 25,
            disabled: "never",
            tooltip: "minimum overlap (bp) length between R1 and R2 reads",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "match_fraction",
            value: 0.9,
            disabled: "never",
            tooltip: "minimum fraction of matching overlap (default 0.90)",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "mismatch_fraction",
            value: [0.02],
            disabled: "never",
            tooltip:
              "maximum fraction of mismatches allowed in overlap (default 0.02)",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          // remove primers and q_filt
          {
            name: "forward_primers",
            value: ["GGWACWGGWTGAACWGTWTAYCCYCC"],
            disabled: "never",
            tooltip: "specify forward primer (5'-3'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: ["TGRTTYTTYGGNCAYCCNGARGTNTA"],
            disabled: "never",
            tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "min_seq_len",
            value: 150,
            disabled: "never",
            tooltip:
              "minimum sequence length (bp) to retain after trimming primers",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "qual_cutoff_3end",
            value: 20,
            disabled: "never",
            tooltip: "phred quality score cutoffs at the 3' end",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "qual_cutoff_5end",
            value: 20,
            disabled: "never",
            tooltip: "phred quality score cutoffs at the 5' end",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "error_rate",
            value: 1,
            disabled: "never",
            tooltip: "maximum bumber of mismatches when searching for primers",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "primer_overlap",
            value: 20,
            disabled: "never",
            tooltip: "minimum overlap to primer sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "maxNs",
            value: 0,
            disabled: "never",
            tooltip: "maximum number of Ns in the read",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          // denoise
          {
            name: "minsize",
            value: 8,
            disabled: "never",
            tooltip:
              "minimum number of reads per cluster to retain (default 8)",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "marker",
            items: [
              "16S",
              "18S_eukaryota",
              "18S_diatom",
              "12S_fish",
              "12S_vertebrate",
              "ITS_fungi",
              "28S_fungi",
              "rbcL_eukaryota",
              "rbcL_diatom",
              "rbcL_landPlant",
              "ITS_plants",
              "COI",
            ],
            value: "COI",
            disabled: "never",
            tooltip: "Which marker classifier will you be using?",
            type: "select",
          },
          // ITSx
          // {
          //   name: "ITS_region",
          //   items: ["ITS1", "ITS2"],
          //   value: "ITS1",
          //   disabled: "never",
          //   tooltip: "Indicate which space region to focus on",
          //   type: "select",
          // },
          // // Assign taxonomy
          // {
          //   name: "built-in classifiers",
          //   items: ["fungallsu", "fungal_unite", "fungal_warcup"],
          //   disabled: "never",
          //   tooltip:
          //     "Use one of the RDP classifier built-in fungal classifiers",
          //   value: "fungallsu",
          //   active: true,
          //   type: "boolselect",
          // },
          // {
          //   name: "custom ref set",
          //   btnName: "select file",
          //   value: "undefined",
          //   disabled: "never",
          //   tooltip: "Link and use a custom rained reference set",
          //   active: false,
          //   type: "boolfile",
          // },
          // // Pseudogene filtering
          // {
          //   name: "tax_to_target",
          //   value: [],
          //   disabled: "never",
          //   tooltip:
          //     "Add taxonomic groups to target eg. 'Metazoa' to target Metazoa",
          //   type: "chip",
          //   iupac: true,
          //   rules: [(v) => v.length <= 20 || "TOO MANY GROUPS"],
          // },
          // {
          //   name: "tax_to_exclude",
          //   value: [],
          //   disabled: "never",
          //   tooltip:
          //     "Add taxonomic groups to exclude eg. Chordata' to exclude vertebrates",
          //   type: "chip",
          //   iupac: true,
          //   rules: [(v) => v.length <= 20 || "TOO MANY GROUPS"],
          // },
          // {
          //   name: "HMM_profile_analysis",
          //   active: false,
          //   btnName: "select file",
          //   value: "undefined",
          //   disabled: "never",
          //   tooltip:
          //     "Removal of sequences with unusually low HMM scores, link a HMM profile",
          //   type: "boolfile",
          // },
          // {
          //   name: "gene_code",
          //   items: [
          //     "standard code",
          //     "vertebrate mitochondrial",
          //     "invertebrate mitochondrial",
          //   ],
          //   disabled: "never",
          //   tooltip:
          //     "Use one of the RDP classifier built-in fungal classifiers",
          //   value: "standard code",
          //   type: "select",
          // },
          // {
          //   name: "start_codon",
          //   items: [
          //     "ATG only",
          //     "ATG and atlter. init. codon",
          //     "any sense codon",
          //   ],
          //   disabled: "never",
          //   tooltip: "ORF start codon to use",
          //   value: "ATG and atlter. init. codon",
          //   type: "select",
          // },
          // {
          //   name: "min_length",
          //   value: 30,
          //   disabled: "never",
          //   tooltip: "minimum length (ORFfinder default 75, min 30 nt)",
          //   type: "numeric",
          //   rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          // },
          // {
          //   name: "ignore_nested",
          //   value: true,
          //   disabled: "never",
          //   tooltip: "ignore nested ORFs",
          //   type: "bool",
          // },
          // {
          //   name: "strand",
          //   items: ["both", "plus", "minus"],
          //   disabled: "never",
          //   tooltip: "ORF start codon to use",
          //   value: "plus",
          //   type: "select",
          // },
        ],
      },
    ],
    ASVs_workflow: [
      {
        tooltip:
          "demultiplex data to per-sample files based on specified index file. Note that for read1 and read2 will get .R1 and .R2 identifiers when demultiplexing paired-end data",
        scriptName: "demux_paired_end_data.sh",
        imageName: "pipecraft/cutadapt:3.5",
        serviceName: "demultiplex",
        manualLink:
          "https://pipecraft2-manual.readthedocs.io/en/stable/user_guide.html#demultiplex",
        disabled: "demultiplexed",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip: "number of cores to use",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "min_seq_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the output sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "do not allow insertions or deletions in the index sequence",
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
              "select your fasta formatted indexes file for demultiplexing, where fasta headers are sample names, and sequences are sample specific index or index combination",
            type: "file",
          },
          {
            name: "index_file_example",
            value:
              "https://pipecraft2-manual.readthedocs.io/en/stable/user_guide.html#indexes-file-example-fasta-formatted",
            disabled: "never",
            type: "link",
            tooltip: "link to PipeCraft manual page, index file examples",
          },
          {
            name: "index_mismatch",
            value: 0,
            disabled: "never",
            tooltip: "allowed mismatches during the index search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "overlap",
            value: 8,
            disabled: "never",
            tooltip:
              "number of overlap bases with the index. Recommended overlap is the max length of the index for confident sequence assignments to samples in the indexes file",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
        ],
      },
      {
        tooltip: "reorient reads based on specified primer sequences",
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
            value: 1,
            disabled: "never",
            tooltip: "allowed mismatches in the primer search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "specify forward primer (5'-3'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
        ],
      },
      {
        tooltip: "remove primers sequences from the reads",
        scriptName: "cut_primers_paired_end_reads.sh",
        imageName: "pipecraft/cutadapt:3.5",
        serviceName: "cut primers",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [
          {
            name: "cores",
            value: 1,
            disabled: "never",
            tooltip:
              "number of cores to use. For paired-end data in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "min_seq_length",
            value: 32,
            disabled: "never",
            tooltip: "minimum length of the output sequence",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "no_indels",
            value: true,
            disabled: "never",
            tooltip:
              "do not allow insertions or deletions is primer search. Mismatches are the only type of errors accounted in the error rate parameter. ",
            type: "bool",
          },
        ],
        Inputs: [
          {
            name: "forward_primers",
            value: [],
            disabled: "never",
            tooltip: "specify forward primer (5'-3'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "reverse_primers",
            value: [],
            disabled: "never",
            tooltip: "specify reverse primer (3'-5'); add up to 13 primers",
            type: "chip",
            iupac: true,
            rules: [(v) => v.length <= 13 || "TOO MANY PRIMERS"],
          },
          {
            name: "mismatches",
            value: 1,
            disabled: "never",
            tooltip: "allowed mismatches in the primer search",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "min_overlap",
            value: 21,
            disabled: "never",
            tooltip:
              "number of overlap bases with the primer sequence. Partial matches are allowed, but short matches may occur by chance, leading to erroneously clipped bases. Specifying higher overlap than the length of primer sequnce will still clip the primer (e.g. primer length is 22 bp, but overlap is specified as 25 - this does not affect the identification and clipping of the primer as long as the match is in the specified mismatch error range)",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "seqs_to_keep",
            items: ["keep_all", "keep_only_linked"],
            value: "keep_all",
            disabled: "never",
            tooltip:
              "'keep_all' keeps the sequences where at least one primer was found (fwd or rev); recommended when cutting primers from paired-end data (unassembled), where individual R1 or R2 read lenghts are shorther than the expected amplicon length. 'keep_only_linked' = keep sequences if primers are found in both ends (fwd…rev); discards the read if both primers were not found in this read; maybe useful for single-end data",
            type: "select",
          },
          {
            name: "pair_filter",
            items: ["both", "any"],
            value: "both",
            disabled: "never",
            tooltip:
              "applies only for paired-end data. 'both', means that a read is discarded only if both, corresponding R1 and R2, reads  do not contain primer strings (i.e. a read is kept if R1 contains primer string, but no primer string found in R2 read). Option 'any' discards the read if primers are not found in both, R1 and R2 reads",
            type: "select",
          },
        ],
      },
      {
        tooltip: "quality filtering with DADA2 'filterAndTrim' function",
        scriptName: "quality_filtering_paired_end_dada2.sh",
        imageName: "pipecraft/dada2:1.20",
        serviceName: "quality filtering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "read_R1",
            value: ["\\.R1"],
            disabled: "single_end",
            tooltip:
              "identifyer string that is common for all R1 reads (e.g. when all R1 files have '.R1' string, then enter '\\.R1'. Note that backslash is only needed to escape dot regex; e.g. when all R1 files have '_R1' string, then enter '_R1'.). When demultiplexing data during this workflow, then specify as '\\.R1'",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "read_R2",
            value: ["\\.R2"],
            disabled: "single_end",
            tooltip:
              "identifyer string that is common for all R2 reads (e.g. when all R2 files have '.R2' string, then enter '\\.R2'. Note that backslash is only needed to escape dot regex; e.g. when all R2 files have '_R1' string, then enter '_R2'.). When demultiplexing data during this workflow, then specify as '\\.R2'",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "samp_ID",
            value: ["\\."],
            disabled: "never",
            tooltip:
              "identifyer string that separates the sample name from redundant charachters (e.g. file name = sample1.R1.fastq, then '\\.' would be the 'identifier string' (sample name = sample1)); note that backslash is only needed to escape dot regex (e.g. when file name = sample1_R1.fastq then specify as '_')",
            type: "chip",
            rules: [(v) => v.length <= 1 || "ADD ONLY ONE IDENTIFIER"],
          },
          {
            name: "maxEE",
            value: 2,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of expected errors",
            type: "numeric",
            rules: [(v) => v >= 0.1 || "ERROR: specify values >= 0.1"],
          },
          {
            name: "maxN",
            value: 0,
            disabled: "never",
            tooltip:
              "discard sequences with more than the specified number of Ns (ambiguous bases)",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "minLen",
            value: 20,
            disabled: "never",
            tooltip:
              "remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "truncQ",
            value: 2,
            disabled: "never",
            tooltip:
              "truncate reads at the first instance of a quality score less than or equal to truncQ",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "truncLen",
            value: 0,
            disabled: "never",
            tooltip:
              "truncate reads after truncLen bases (applies to R1 reads when working with paired-end data). Reads shorter than this are discarded. Explore quality profiles (with QualityCheck module) see whether poor quality ends needs to truncated",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "truncLen_R2",
            value: 0,
            disabled: "single_end",
            tooltip:
              "truncate R2 reads after truncLen bases. Reads shorter than this are discarded. Explore quality profiles (with QualityCheck module) see whether poor quality ends needs to truncated",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "maxLen",
            value: 9999,
            disabled: "never",
            tooltip:
              "remove reads with length greater than maxLen. maxLen is enforced on the raw reads. In dada2, the default = Inf, but here set as 9999",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "minQ",
            value: 0,
            disabled: "never",
            tooltip:
              "after truncation, reads contain a quality score below minQ will be discarded",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "matchIDs",
            value: true,
            disabled: "single_end",
            tooltip:
              "applies only for paired-end data. If TRUE, then double-checking (with seqkit pair) that only paired reads that share ids are outputted",
            type: "bool",
          },
        ],
      },
      {
        tooltip: "select the denoising options for DADA2 'dada' function",
        scriptName: "assemble_paired_end_data_dada2_wf.sh",
        imageName: "pipecraft/dada2:1.20",
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
              "if pool = TRUE, the algorithm will pool together all samples prior to sample inference. Pooling improves the detection of rare variants, but is computationally more expensive. If pool = 'pseudo', the algorithm will perform pseudo-pooling between individually processed samples. This argument has no effect if only 1 sample is provided, and pool does not affect error rates, which are always estimated from pooled observations across samples",
            type: "select",
          },
          {
            name: "selfConsist",
            disabled: "never",
            value: false,
            tooltip:
              "if selfConsist = TRUE, the algorithm will alternate between sample inference and error rate estimation until convergence",
            type: "bool",
          },
          {
            name: "qualityType",
            items: ["Auto", "FastqQuality"],
            value: "Auto",
            disabled: "never",
            tooltip:
              "Auto means to attempt to auto-detect the fastq quality encoding. This may fail for PacBio files with uniformly high quality scores, in which case use 'FastqQuality'",
            type: "select",
          },
        ],
      },
      {
        tooltip:
          "assemble paired-end reads (R1 and R2) with DADA2 'mergePairs' function",
        scriptName: "assemble_paired_end_data_dada2_wf.sh",
        imageName: "pipecraft/dada2:1.20",
        serviceName: "merge Pairs",
        selected: "always",
        disabled: "never",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "minOverlap",
            value: 12,
            disabled: "never",
            tooltip:
              "the minimum length of the overlap required for merging the forward and reverse reads",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "maxMismatch",
            value: 0,
            disabled: "never",
            tooltip: "the maximum mismatches allowed in the overlap region",
            type: "numeric",
            rules: [(v) => v >= 0 || "ERROR: specify values >= 0"],
          },
          {
            name: "trimOverhang",
            value: false,
            disabled: "never",
            tooltip:
              "if TRUE, overhangs in the alignment between the forwards and reverse read are trimmed off. Overhangs are when the reverse read extends past the start of the forward read, and vice-versa, as can happen when reads are longer than the amplicon and read into the other-direction primer region",
            type: "bool",
          },
          {
            name: "justConcatenate",
            value: false,
            disabled: "never",
            tooltip:
              "if TRUE, the forward and reverse-complemented reverse read are concatenated rather than merged, with a NNNNNNNNNN (10 Ns) spacer inserted between them",
            type: "bool",
          },
        ],
      },
      {
        tooltip: "remove chimeras with DADA2 'removeBimeraDenovo' function",
        scriptName: "chimera_filtering_dada2_wf.sh",
        imageName: "pipecraft/dada2:1.20",
        serviceName: "chimera filtering",
        disabled: "never",
        selected: "always",
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "method",
            items: ["consensus", "pooled", "per-sample"],
            value: "consensus",
            disabled: "never",
            tooltip:
              "'consensus' - the samples are independently checked for chimeras, and a consensus decision on each sequence variant is made. If 'pooled', the samples are all pooled together for chimera identification. If 'per-sample', the samples are independently checked for chimeras",
            type: "select",
          },
        ],
      },

      {
        tooltip:
          "assign taxonomy with DADA2 'assignTaxonomy' function against the selected database. Untick the checkbox to skip this step",
        scriptName: "taxonomy_dada2.sh",
        imageName: "pipecraft/dada2:1.20",
        serviceName: "assign Taxonomy",
        disabled: "never",
        selected: false,
        showExtra: false,
        extraInputs: [],
        Inputs: [
          {
            name: "dada2_database",
            btnName: "select fasta",
            value: "undefined",
            disabled: "never",
            tooltip:
              "select a reference database fasta file for taxonomy annotation",
            type: "file",
          },
          {
            name: "download databases",
            value: "https://benjjneb.github.io/dada2/training.html",
            disabled: "never",
            type: "link",
            tooltip: "link to download DADA2-formatted reference databases",
          },
          {
            name: "minBoot",
            value: 50,
            disabled: "never",
            tooltip:
              "the minimum bootstrap confidence for assigning a taxonomic level",
            type: "numeric",
            rules: [(v) => v >= 1 || "ERROR: specify values >= 1"],
          },
          {
            name: "tryRC",
            value: false,
            disabled: "never",
            tooltip:
              "the reverse-complement of each sequences will be used for classification if it is a better match to the reference sequences than the forward sequence",
            type: "bool",
          },
        ],
      },
    ],
    customWorkflowInfo: {
      OTUs_workflow: {
        info: "OTUs workflow with vsearch",
        link: "https://github.com/torognes/vsearch",
        title: "vsearch OTUs workflow",
      },
      ASVs_workflow: {
        info: "This workflow is based on DADA2 pipeline tutorial",
        link: "https://benjjneb.github.io/dada2/tutorial.html",
        title: "DADA2 ASVs workflow for PAIRED-END reads",
      },
      Metaworks_workflow: {
        info: "This workflow is based on Metaworks workflow quickstarts",
        link: "https://terrimporter.github.io/MetaWorksSite/quickstart/",
        title: "MetaWorks ESVs workflow for demultiplexed PAIRED-END reads",
      },
    },
  },
  getters: {
    steps2Run: (state) => (id) => {
      let steps = state[id].filter(
        (el) => el.selected == true || el.selected == "always"
      );
      return steps.length;
    },
    selectedStepsReady: (state) => {
      let x = 0;
      let fileInputValues = [];
      for (let index of state.selectedSteps.entries()) {
        state.selectedSteps[index[0]].services.forEach((input) => {
          if (input.selected === true || input.selected == "always") {
            x = x + 1;
          }
        });
      }
      for (let index of state.selectedSteps.entries()) {
        state.selectedSteps[index[0]].services.forEach((input) => {
          if (input.selected === true || input.selected == "always") {
            input.Inputs.forEach((input) => {
              if (input.type == "file") {
                fileInputValues.push(input.value);
              }
            });
          }
        });
      }
      if (
        x == state.selectedSteps.length &&
        state.selectedSteps.length > 0 &&
        !fileInputValues.includes("undefined")
      ) {
        return true;
      } else {
        return false;
      }
    },
    customWorkflowReady: (state) => {
      let Ready = [];
      if (state.route.params.workflowName) {
        Ready.push(true);
        state[state.route.params.workflowName].forEach((step) => {
          if (step.selected == true || step.selected == "always") {
            step.Inputs.forEach((input) => {
              if (input.type == "file" || input.type == "chip") {
                if (input.value == "undefined" || input.value.length < 1) {
                  Ready.push(false);
                }
              }
            });
          }
        });
      }
      if (Ready.includes(false)) {
        return false;
      } else {
        return true;
      }
    },
  },
  mutations: {
    activatePullLoader(state) {
      state.pullLoader.active = true;
    },
    deactivatePullLoader(state) {
      state.pullLoader.active = false;
    },
    // runInfo: { active: false, type: null, step: null, nrOfSteps: null },
    resetRunInfo(state) {
      state.runInfo = {
        active: false,
        type: null,
        step: null,
        nrOfSteps: null,
        containerID: null,
      };
    },
    addRunInfo(state, payload) {
      let result = Object.fromEntries(
        Object.keys(state.runInfo).map((_, i) => [
          Object.keys(state.runInfo)[i],
          payload[i],
        ])
      );
      state.runInfo = result;
    },
    toggle_PE_SE_scripts(state, payload) {
      for (const [key] of Object.entries(state.customWorkflowInfo)) {
        for (let i = 0; i < state[key].length; i++) {
          if (payload == "paired_end") {
            state[key][i].scriptName = state[key][i].scriptName.replace(
              "single_end",
              "paired_end"
            );
            if (state[key][i].disabled == "single_end") {
              state[key][i].selected = "always";
            }
          }
          if (payload == "single_end") {
            state[key][i].scriptName = state[key][i].scriptName.replace(
              "paired_end",
              "single_end"
            );
            if (state[key][i].disabled == "single_end") {
              state[key][i].selected = "never";
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
        for (let j = 0; j < state.selectedSteps[i].services.length; j++) {
          if (payload == "paired_end") {
            state.selectedSteps[i].services[j].scriptName = state.selectedSteps[
              i
            ].services[j].scriptName.replace("single_end", "paired_end");
          }
          if (payload == "single_end") {
            state.selectedSteps[i].services[j].scriptName = state.selectedSteps[
              i
            ].services[j].scriptName.replace("paired_end", "single_end");
          }
        }
      }
      for (let i = 0; i < state.selectedSteps.length; i++) {
        if (payload == "single_end") {
          state.selectedSteps = state.selectedSteps.filter(
            (item) => !(item.stepName == "assemble paired-end")
          );
          if (router.currentRoute != "/home") {
            router.push("/home").catch(() => {
              /* ignore */
            });
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
            (item) => !(item.stepName == "demultiplex")
          );
          if (router.currentRoute != "/home") {
            router.push("/home").catch(() => {
              /* ignore */
            });
          }
        }
      }
    },
    loadWorkflow(state, payload) {
      state.selectedSteps = payload;
    },
    loadCustomWorkflow(state, payload) {
      state[payload[1]] = payload[0];
    },
    toggleExtra(state, payload) {
      state.selectedSteps[payload.stepIndex].services[
        payload.serviceIndex
      ].showExtra =
        !state.selectedSteps[payload.stepIndex].services[payload.serviceIndex]
          .showExtra;
    },
    toggleExtraCustomWorkflow(state, payload) {
      state[payload.workflowName][payload.serviceIndex].showExtra =
        !state[payload.workflowName][payload.serviceIndex].showExtra;
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
    blastSwitch(state, value) {
      if (value == "blastn") {
        state.OTUs_workflow[8].extraInputs[1].value = 11;
        state.OTUs_workflow[8].extraInputs[2].value = 2;
        state.OTUs_workflow[8].extraInputs[3].value = -3;
        state.OTUs_workflow[8].extraInputs[4].value = 5;
        state.OTUs_workflow[8].extraInputs[5].value = 2;
      } else if (value == "megablast") {
        state.OTUs_workflow[8].extraInputs[1].value = 28;
        state.OTUs_workflow[8].extraInputs[2].value = 1;
        state.OTUs_workflow[8].extraInputs[3].value = -2;
        state.OTUs_workflow[8].extraInputs[4].value = 0;
        state.OTUs_workflow[8].extraInputs[5].value = undefined;
      }
    },
    blastSwitch2(state, payload) {
      if (payload.value == "blastn") {
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[1].value = 11;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[2].value = 2;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[3].value = -3;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[4].value = 5;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[5].value = 2;
      } else if (payload.value == "megablast") {
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[1].value = 28;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[2].value = 1;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[3].value = -2;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[4].value = 0;
        state.selectedSteps[payload.i1].services[
          payload.i2
        ].extraInputs[5].value = undefined;
      }
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
      if (
        state[payload.name][payload.serviceIndex].serviceName == "itsx" &&
        payload.selected == true
      ) {
        state[payload.name][7].selected = !payload.selected;
        state[payload.name][8].selected = !payload.selected;
      } else {
        state[payload.name][payload.serviceIndex].selected = payload.selected;
      }
    },
  },
  actions: {},
  modules: {},
});
