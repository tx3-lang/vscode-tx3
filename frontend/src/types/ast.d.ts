/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type PolicyValue =
  | {
      Constructor: PolicyConstructor;
    }
  | {
      Assign: HexStringLiteral;
    };
export type PolicyField =
  | {
      Hash: DataExpr;
    }
  | {
      Script: DataExpr;
    }
  | {
      Ref: DataExpr;
    };
export type DataExpr =
  | ("None" | "Unit")
  | {
      Number: number;
    }
  | {
      Bool: boolean;
    }
  | {
      String: StringLiteral;
    }
  | {
      HexString: HexStringLiteral;
    }
  | {
      Constructor: DatumConstructor;
    }
  | {
      Identifier: Identifier;
    }
  | {
      PropertyAccess: PropertyAccess;
    }
  | {
      BinaryOp: DataBinaryOp;
    };
export type BinaryOperator = "Add" | "Subtract";
export type MintBlockField =
  | {
      Amount: AssetExpr;
    }
  | {
      Redeemer: DataExpr;
    };
export type AssetExpr =
  | {
      Constructor: AssetConstructor;
    }
  | {
      BinaryOp: AssetBinaryOp;
    }
  | {
      PropertyAccess: PropertyAccess;
    }
  | {
      Identifier: Identifier;
    };
export type InputBlockField =
  | {
      From: AddressExpr;
    }
  | {
      DatumIs: Type;
    }
  | {
      MinAmount: AssetExpr;
    }
  | {
      Redeemer: DataExpr;
    }
  | {
      Ref: DataExpr;
    };
export type AddressExpr =
  | {
      String: StringLiteral;
    }
  | {
      HexString: HexStringLiteral;
    }
  | {
      Identifier: Identifier;
    };
export type Type =
  | ("Unit" | "Int" | "Bool" | "Bytes" | "Address" | "UtxoRef" | "AnyAsset")
  | {
      Custom: Identifier;
    };
export type OutputBlockField =
  | {
      To: AddressExpr;
    }
  | {
      Amount: AssetExpr;
    }
  | {
      Datum: DataExpr;
    };

export interface Program {
  assets: AssetDef[];
  parties: PartyDef[];
  policies: PolicyDef[];
  span: Span;
  txs: TxDef[];
  types: TypeDef[];
  [k: string]: unknown;
}
export interface AssetDef {
  asset_name: string;
  name: string;
  policy: HexStringLiteral;
  span: Span;
  [k: string]: unknown;
}
export interface HexStringLiteral {
  span: Span;
  value: string;
  [k: string]: unknown;
}
export interface Span {
  dummy: boolean;
  end: number;
  start: number;
  [k: string]: unknown;
}
export interface PartyDef {
  name: string;
  span: Span;
  [k: string]: unknown;
}
export interface PolicyDef {
  name: string;
  span: Span;
  value: PolicyValue;
  [k: string]: unknown;
}
export interface PolicyConstructor {
  fields: PolicyField[];
  span: Span;
  [k: string]: unknown;
}
export interface StringLiteral {
  span: Span;
  value: string;
  [k: string]: unknown;
}
export interface DatumConstructor {
  case: VariantCaseConstructor;
  span: Span;
  type: Identifier;
  [k: string]: unknown;
}
export interface VariantCaseConstructor {
  fields: RecordConstructorField[];
  name: Identifier;
  span: Span;
  spread?: DataExpr | null;
  [k: string]: unknown;
}
export interface RecordConstructorField {
  name: Identifier;
  span: Span;
  value: DataExpr;
  [k: string]: unknown;
}
export interface Identifier {
  span: Span;
  value: string;
  [k: string]: unknown;
}
export interface PropertyAccess {
  object: Identifier;
  path: Identifier[];
  span: Span;
  [k: string]: unknown;
}
export interface DataBinaryOp {
  left: DataExpr;
  operator: BinaryOperator;
  right: DataExpr;
  span: Span;
  [k: string]: unknown;
}
export interface TxDef {
  burn?: BurnBlock | null;
  inputs: InputBlock[];
  mint?: MintBlock | null;
  name: string;
  outputs: OutputBlock[];
  parameters: ParameterList;
  span: Span;
  [k: string]: unknown;
}
export interface BurnBlock {
  fields: MintBlockField[];
  span: Span;
  [k: string]: unknown;
}
export interface AssetConstructor {
  amount: DataExpr;
  span: Span;
  type: Identifier;
  [k: string]: unknown;
}
export interface AssetBinaryOp {
  left: AssetExpr;
  operator: BinaryOperator;
  right: AssetExpr;
  span: Span;
  [k: string]: unknown;
}
export interface InputBlock {
  fields: InputBlockField[];
  is_many: boolean;
  name: string;
  span: Span;
  [k: string]: unknown;
}
export interface MintBlock {
  fields: MintBlockField[];
  span: Span;
  [k: string]: unknown;
}
export interface OutputBlock {
  fields: OutputBlockField[];
  name?: string | null;
  span: Span;
  [k: string]: unknown;
}
export interface ParameterList {
  parameters: ParamDef[];
  span: Span;
  [k: string]: unknown;
}
export interface ParamDef {
  name: string;
  type: Type;
  [k: string]: unknown;
}
export interface TypeDef {
  cases: VariantCase[];
  name: string;
  span: Span;
  [k: string]: unknown;
}
export interface VariantCase {
  fields: RecordField[];
  name: string;
  span: Span;
  [k: string]: unknown;
}
export interface RecordField {
  name: string;
  span: Span;
  type: Type;
  [k: string]: unknown;
}
