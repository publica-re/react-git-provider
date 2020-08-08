import pathUtils from "path";

import { GitStatus, GitStatusOption, FileStatus } from "./_types";

export function gitStatusFromQuery(
  status:
    | "modified"
    | "ignored"
    | "unmodified"
    | "*modified"
    | "*deleted"
    | "*added"
    | "absent"
    | "deleted"
    | "added"
    | "*unmodified"
    | "*absent"
    | "*undeleted"
    | "*undeletemodified"
): GitStatus {
  const staged = status.startsWith("*");
  const statusName = staged ? status.slice(1) : status;
  let option = GitStatusOption.Modified;
  switch (statusName) {
    case "modified":
      option = GitStatusOption.Modified;
      break;
    case "ignored":
      option = GitStatusOption.Ignored;
      break;
    case "unmodified":
      option = GitStatusOption.UnModified;
      break;
    case "deleted":
      option = GitStatusOption.Deleted;
      break;
    case "added":
      option = GitStatusOption.Added;
      break;
    case "absent":
      option = GitStatusOption.Absent;
      break;
    case "undeleted":
      option = GitStatusOption.UnDeleted;
      break;
    case "undeletedmodified":
      option = GitStatusOption.UnDeletedModified;
      break;
  }
  return {
    staged: staged,
    option: option,
  };
}

export function parseStatusMatrix([
  file,
  headStatus,
  workDirStatus,
  stageStatus,
]: [string, 0 | 1, 0 | 1 | 2, 0 | 1 | 2 | 3]): { [path: string]: FileStatus } {
  function parseStatusMatrixHelper(): GitStatus {
    switch ([headStatus, workDirStatus, stageStatus].join("")) {
      case "000":
        return { staged: true, option: GitStatusOption.Absent };
      case "003":
        return { staged: false, option: GitStatusOption.Absent };
      case "020":
        return { staged: false, option: GitStatusOption.Added };
      case "022":
        return { staged: true, option: GitStatusOption.Added };
      case "023":
        return { staged: false, option: GitStatusOption.Added };
      case "100":
        return { staged: true, option: GitStatusOption.Deleted };
      case "101":
        return { staged: false, option: GitStatusOption.Deleted };
      case "103":
        return { staged: false, option: GitStatusOption.Deleted };
      case "110":
        return { staged: false, option: GitStatusOption.UnDeleted };
      case "111":
        return { staged: false, option: GitStatusOption.UnModified };
      case "113":
        return { staged: false, option: GitStatusOption.Modified };
      case "120":
        return { staged: false, option: GitStatusOption.UnDeletedModified };
      case "121":
        return { staged: false, option: GitStatusOption.Modified };
      case "122":
        return { staged: true, option: GitStatusOption.Modified };
      case "123":
        return { staged: false, option: GitStatusOption.Modified };
      default:
        throw Error(`unknown file status`);
    }
  }
  const basename = pathUtils.basename(file);
  const dirname = pathUtils.dirname(file);
  return {
    [pathUtils.resolve(file)]: {
      type: "file",
      basename: basename,
      dirname: dirname,
      ignored: false,
      status: parseStatusMatrixHelper(),
    },
  };
}

export const nonPrintableChars = new Uint8Array(
  Buffer.from(
    [
      7,
      8,
      9,
      0,
      12,
      13,
      27,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      64,
      65,
      66,
      67,
      68,
      69,
      70,
      71,
      72,
      73,
      74,
      75,
      76,
      77,
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91,
      92,
      93,
      94,
      95,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      106,
      107,
      108,
      109,
      110,
      111,
      112,
      113,
      114,
      115,
      116,
      117,
      118,
      119,
      120,
      121,
      122,
      123,
      124,
      125,
      126,
      128,
      129,
      130,
      131,
      132,
      133,
      134,
      135,
      136,
      137,
      138,
      139,
      140,
      141,
      142,
      143,
      144,
      145,
      146,
      147,
      148,
      149,
      150,
      151,
      152,
      153,
      154,
      155,
      156,
      157,
      158,
      159,
      160,
      161,
      162,
      163,
      164,
      165,
      166,
      167,
      168,
      169,
      170,
      171,
      172,
      173,
      174,
      175,
      176,
      177,
      178,
      179,
      180,
      181,
      182,
      183,
      184,
      185,
      186,
      187,
      188,
      189,
      190,
      191,
      192,
      193,
      194,
      195,
      196,
      197,
      198,
      199,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207,
      208,
      209,
      210,
      211,
      212,
      213,
      214,
      215,
      216,
      217,
      218,
      219,
      220,
      221,
      222,
      223,
      224,
      225,
      226,
      227,
      228,
      229,
      230,
      231,
      232,
      233,
      234,
      235,
      236,
      237,
      238,
      239,
      240,
      241,
      242,
      243,
      244,
      245,
      246,
      247,
      248,
      249,
      250,
      251,
      252,
      253,
      254,
      255,
    ]
      .map((char) => String.fromCodePoint(char))
      .toString()
  )
);
