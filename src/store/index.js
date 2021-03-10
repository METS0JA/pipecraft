import Vue from "vue";
import Vuex from "vuex";
var _ = require("lodash");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    workingDir: "",
    env_variables: ["FOO=bar", "BAZ=quux"],
    selectedSteps: [],
    steps: [
      {
        stepName: "reorient",
        services: [
          {
            serviceName: "reorient",
            scriptName: "reorient_paired_end_reads.sh",
            imageName: "pipecraft/reorient:1",
            selected: false,
            fileInputs: [],
            numericInputs: [
              { name: "mismatches", value: 2, tooltip: "???????????" },
            ],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [
              {
                name: "forward_primers",
                value: [],
                tooltip: "manually define up to 13 primers",
              },
              {
                name: "reverse_primers",
                value: [],
                tooltip: "manually define up to 13 primers",
              },
            ],
          },
        ],
      },
      {
        stepName: "demultiplex",
        services: [
          {
            serviceName: "demultiplex",
            selected: false,
            fileInputs: [
              {
                name: "add a barcodes file",
                btnName: "select file",
                value: "No file selected",
                tooltip:
                  "Add a file that can contain the sequences of the forward and reverse primers and barcodes and their sample identfiers.",
              },
            ],
            numericInputs: [
              {
                name: "bdiffs",
                value: 1,
                tooltip:
                  "Maximum number of differences to the barcode sequence.",
              },
              {
                name: "pdiffs",
                value: 2,
                tooltip:
                  "Maximum number of differences to the primer sequence.",
              },
              {
                name: "tdiffs",
                value: 2,
                tooltip:
                  "Maximum total number of differences to the barcode and primer.",
              },
              {
                name: "min_unique_size",
                value: 2,
                tooltip:
                  "Discard sequences with an abundance value smaller than set value",
              },
            ],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "example inputs",
            selected: false,
            numericInputs: [
              { name: "param1", value: 1, tooltip: "yo" },
              { name: "param2", value: 2, tooltip: "yo mees" },
              { name: "param12", value: 2, tooltip: "yo mees" },
              { name: "param11", value: 2, tooltip: "yo mees", extra: true },
            ],
            booleanInputs: [
              { name: "param3", value: true, tooltip: "cya" },
              { name: "param4", value: true, tooltip: "tere" },
            ],
            selectInputs: [
              {
                name: "param5",
                value: ["16S", "ITS", "18S"],
                tooltip: "zzzZZzzZZZzzz",
              },
              {
                name: "param6",
                value: ["Silva", "Unite", "GreenGenes", "RDP"],
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
            fileInputs: [
              {
                name: "file_1",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
              },
              {
                name: "file_2",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
              },
            ],
            booleanFileInputs: [
              {
                name: "bool_file_1",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
                active: false,
              },
              {
                name: "bool_file_2",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
                active: false,
              },
            ],
            booleanSelectInputs: [
              {
                name: "bool_select_1",
                value: ["16S", "ITS", "18S"],
                tooltip: "zzZZzz",
                active: false,
              },
              {
                name: "bool_select_2",
                value: ["Silva", "Unite", "GreenGenes", "RDP"],
                tooltip: "zzZZzz",
                active: false,
              },
            ],
            chipInputs: [
              {
                name: "chipSelect",
                value: ["16S", "ITS", "18S"],
                tooltip: "zzzZZzzZZZzzz",
              },
              {
                name: "chipSelect2",
                value: ["Silva", "Unite", "GreenGenes", "RDP"],
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
          },
        ],
      },
      {
        stepName: "remove adapters",
        services: [
          {
            serviceName: "cutadapt",
            selected: false,
            fileInputs: [],
            numericInputs: [
              {
                name: "error_rate",
                value: 0.15,
                tooltip:
                  "Allowed error rate in primer search. By default, error rate is 0.1, which means that in e.g. 1 error is allowd in a 10 bp primer (10% error rate).",
              },
              {
                name: "min_seq_length",
                value: 10,
                tooltip: "minimum length of the output sequence",
                extra: true,
              },
              {
                name: "cores",
                value: 1,
                tooltip:
                  "number of cores to use. For paired-end dta in fasta format, set to 1 [default]. For fastq formats you may set the value to 0 to use all cores.",
                extra: true,
              },
            ],
            booleanInputs: [
              {
                name: "revcomp",
                value: true,
                tooltip:
                  "search also revere complementary matches for barcodes",
                extra: true,
              },
              {
                name: "no_indels",
                value: false,
                tooltip:
                  "do not allow insertions or deletions is primer search. Mismatches are the only type of errprs accounted in the error rate parameter. ",
                extra: true,
              },
              {
                name: "discard_untrimmed",
                value: true,
                tooltip:
                  "Discard sequences where specified primers were not found.",
                extra: true,
              },
            ],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [
              {
                name: "seqs_to_keep",
                value: ["keep_all", "keep_only_linked"],
                tooltip:
                  "Keep seqs with primers found in both ends(linked), or keeps seqs with primer found atlest in one end(all)",
              },
            ],
            chipInputs: [
              {
                name: "forward_primers",
                value: [],
                tooltip: "Add up to 13 PCR primers",
              },
              {
                name: "reverse_primers",
                value: [],
                tooltip: "Add up to 13 PCR primers",
              },
            ],
          },
          {
            serviceName: "trimmomatic",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "mothur",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "quality filter",
        services: [
          {
            serviceName: "vsearch",
            selected: false,
            numericInputs: [
              {
                name: "fastq_maxee",
                value: 1,
                tooltip:
                  "Discard sequences with more than the specified number of expected error",
              },
              {
                name: "fastq_maxns",
                value: 0,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
              },
              {
                name: "fastq_minlen",
                value: 1,
                tooltip:
                  "Discard sequences with less than the specified number of bases",
              },
              {
                name: "fastq_maxlen",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of bases",
              },
              {
                name: "fastq_truncqual",
                value: 0,
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
              },
              {
                name: "fastq_qmin",
                value: 0,
                tooltip:
                  "Specify the minimum quality score accepted for FASTQ files",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "mothur",
            selected: false,
            numericInputs: [
              {
                name: "qwindowaverage",
                value: 30,
                tooltip:
                  "Set the minimum average quality score allowed over a window",
              },
              {
                name: "qwindowsize",
                value: 32,
                tooltip: "Set the number of bases in a window",
              },
              {
                name: "maxambig",
                value: 0,
                tooltip: "Set the number of allowed ambiguous base calls",
              },
              {
                name: "qthreshold",
                value: null,
                tooltip:
                  "Discard sequences with a basecall below set quality value",
              },
              {
                name: "minlength",
                value: null,
                tooltip:
                  "Discard sequences with less than the specified number of bases",
              },
              {
                name: "maxlength",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of bases",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "dada2",
            selected: false,
            numericInputs: [
              {
                name: "maxEE",
                value: 1,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors",
              },
              {
                name: "maxN",
                value: 0,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
              },
              {
                name: "minLen",
                value: 20,
                tooltip:
                  "Remove reads with length less than minLen. minLen is enforced after all other trimming and truncation",
              },
              {
                name: "truncQ",
                value: null,
                tooltip:
                  "Truncate reads at the first instance of a quality score less than or equal to truncQ",
              },
              {
                name: "truncLen",
                value: 0,
                tooltip:
                  "Truncate reads after truncLen bases. Reads shorter than this are discarded",
              },
              {
                name: "maxLen",
                value: null,
                tooltip:
                  "Remove reads with length greater than maxLen. maxLen is enforced on the raw reads",
              },
              {
                name: "minQ",
                value: 0,
                tooltip:
                  "After truncation, reads contain a quality score below minQ will be discarded",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "usearch",
            selected: false,
            numericInputs: [
              {
                name: "fastq_maxee",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors for all bases in the read (is used after any truncation options have been applied).",
              },
              {
                name: "fastq_maxns",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of N’s",
              },
              {
                name: "fastq_minlen",
                value: null,
                tooltip:
                  "Discard sequences with less than the specified number of bases",
              },
              {
                name: "fastq_stripleft",
                value: null,
                tooltip: "Delete the first N bases in the read",
              },
              {
                name: "fastq_truncqual",
                value: null,
                tooltip:
                  "Truncate sequences starting from the first basewith the specified base quality score value or lower",
              },
              {
                name: "fastq_maxee_rate",
                value: null,
                tooltip:
                  "Discard sequences with more than the specified number of expected errors per base",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "trimmomatic",
            selected: false,
            numericInputs: [
              {
                name: "windowSize",
                value: 1,
                tooltip:
                  "Perform a sliding window trimming, cutting once the average quality within the window falls below a treshold",
              },
              {
                name: "requiredQuality",
                value: 0,
                tooltip:
                  "Perform a sliding window trimming, cutting once the average quality within the window falls below a treshold",
              },
              {
                name: "LEADING",
                value: null,
                tooltip:
                  "Cut bases off the start of a read, if below a threshold quality",
              },
              {
                name: "TRAILING",
                value: null,
                tooltip:
                  "Cut bases off the end of a read, if below a threshold quality",
              },
              {
                name: "MINLEN",
                value: null,
                tooltip: "Drop the read if it is below a specified length",
              },
              {
                name: "AVGQAUL",
                value: null,
                tooltip:
                  "Drop the read if the average quality is below the specified level",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "assemble paired-end",
        services: [
          {
            serviceName: "pandaseq",
            selected: false,
            numericInputs: [
              {
                name: "minoverlap -o",
                value: 1,
                tooltip:
                  "Sets the minimum overlap between forward and reverse reads.",
              },
              {
                name: "minlen -l",
                value: 1,
                tooltip:
                  "Sets the minimum length for a sequence before assembly",
              },
              {
                name: "maxoverlap -O",
                value: 1,
                tooltip:
                  "Sets the maximum overlap between forward and reverse reads.",
              },
              {
                name: "maxlen -L",
                value: 1,
                tooltip: "Sets maximum length for a sequence before assembly.",
              },
            ],
            booleanInputs: [
              {
                name: "write unpaired",
                value: false,
                tooltip:
                  "Write sequences for which the optimal alignment cannot be computed to a file as concatenated pairs.",
              },
            ],
            fileInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "flash",
            selected: false,
            numericInputs: [
              {
                name: "min overlap -m",
                value: 100,
                tooltip:
                  "Set the minimum required overlap length between two reads to provide a confident overlap.",
              },
              {
                name: "mismatch ratio -x",
                value: 0.25,
                tooltip:
                  "Set the maximum allowed ratio of the number of mismatches at the overlap length.",
              },
              {
                name: "max overlap -M",
                value: null,
                tooltip:
                  "Set the maximum overlap length expected in approximately 90% of read pairs.",
              },
              {
                name: "read length -r",
                value: 1,
                tooltip: "Average read length.",
              },
              {
                name: "fragment length -f",
                value: 1,
                tooltip: "Average fragment length",
              },
              {
                name: "σ fragment lengths -s",
                value: 1,
                tooltip:
                  "if you do not know standard deviation of the fragment library, you can probably assume that the standard deviation is 10% of the average fragment length",
              },
              {
                name: "phredOffset -p",
                value: 1,
                tooltip:
                  "Set the smallest ASCII value of the characters used to represent quality values of bases in fastq files. 33 for latest Illumina and Sanger or 64 for earlier Illumina.",
              },
            ],
            fileInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "vsearch",
            selected: false,
            numericInputs: [
              {
                name: "--fastq_minmergelen",
                value: 1,
                tooltip: "Specify the minimum length of the merged sequence",
              },
              {
                name: "--fastq_maxdiffs",
                value: 1,
                tooltip:
                  "Specify the maximum number of non-matching nucleotides allowed in the overlap region.",
              },
              {
                name: "--fastq_minovlen",
                value: 1,
                tooltip: "Specify the minimum overlap between the mergedreads.",
              },
            ],
            booleanInputs: [
              {
                name: "allowmergestagger",
                value: true,
                tooltip:
                  "Allow to merge staggered read pairs.(--fastq_allowmergestagger) Staggered pairsare pairs where the 3’ end of the reverse read has an overhang to the left of the 5’ end of the forward read",
              },
            ],
            fileInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "remove chimeras",
        services: [
          {
            serviceName: "vsearch",
            selected: false,
            booleanInputs: [
              { name: "denovno", value: false, tooltip: "zzzZZzzZZZzzz" },
              {
                name: "refrence based",
                value: false,
                tooltip: "zzzZZzzZZZzzz",
              },
            ],

            numericInputs: [
              { name: "abskew", value: 1, tooltip: "zzzZZzzZZZzzz" },
              {
                name: "abundace annotation",
                value: 1,
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
            fileInputs: [
              {
                name: "select refrence DB",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
              },
            ],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
          },
          {
            serviceName: "usearch",
            selected: false,
            booleanInputs: [
              { name: "denovo", value: false, tooltip: "zzzZZzzZZZzzz" },
              {
                name: "refrence based",
                value: false,
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
            numericInputs: [
              { name: "abskew", value: 1, tooltip: "zzzZZzzZZZzzz" },
              {
                name: "abundance annotation",
                value: 1,
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
            fileInputs: [
              {
                name: "select refrence DB",
                btnName: "select file",
                value: "No file selected",
                tooltip: "zzZZzz",
              },
            ],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "gene extraction",
        services: [
          {
            serviceName: "itsx",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "metaxa",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "vxtractor",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "cluster",
        services: [
          {
            serviceName: "mothure",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "cd-hit",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "swarm",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "vsearch",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
      {
        stepName: "assing taxonomy",
        services: [
          {
            serviceName: "mothur",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
          {
            serviceName: "blast",
            selected: false,
            fileInputs: [],
            numericInputs: [],
            booleanInputs: [],
            booleanSelectInputs: [],
            booleanFileInputs: [],
            selectInputs: [],
            chipInputs: [],
          },
        ],
      },
    ],
  },
  getters: {},
  mutations: {
    toggleExtra(state, payload) {
      console.log(state, payload);
      const inputTypes = [
        "chipInputs",
        "fileInputs",
        "numericInputs",
        "booleanInputs",
        "booleanFileInputs",
        "selectInputs",
        "booleanSelectInputs",
      ];
      for (let index = 0; index < inputTypes.length; index++) {
        var element = inputTypes[index];
        state.selectedSteps[payload.stepIndex].services[payload.serviceIndex][
          element
        ].forEach((input) => {
          if (input.extra !== undefined) {
            input.extra = !input.extra;
          }
        });
      }
    },
    addWorkingDir(state, filePath) {
      state.workingDir = filePath;
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
