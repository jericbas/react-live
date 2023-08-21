import { useEffect, useState, ComponentType, PropsWithChildren } from "react";
import LiveContext from "./LiveContext";
import { generateElement, renderElementAsync } from "../../utils/transpile";
import { themes } from "prism-react-renderer";

type ProviderState = {
  element?: ComponentType | null;
  error?: string;
};

type Props = {
  code?: string;
  disabled?: boolean;
  enableTypeScript?: boolean;
  language?: string;
  noInline?: boolean;
  scope?: Record<string, unknown>;
  theme?: typeof themes.nightOwl;
  transformCode?(code: string): void;
};

function LiveProvider({
  children,
  code = "",
  language = "tsx",
  theme,
  enableTypeScript = true,
  disabled = false,
  scope,
  transformCode,
  noInline = false,
}: PropsWithChildren<Props>) {
  const [state, setState] = useState<ProviderState>({
    error: undefined,
    element: undefined,
  });

  async function transpileAsync(newCode: string) {
    const errorCallback = (error: Error) => {
      setState({ error: error.toString(), element: undefined });
    };

    try {
      const transformResult = transformCode ? transformCode(newCode) : newCode;
      const transformedCode = await Promise.resolve(transformResult);

      if (typeof transformedCode !== "string") {
        throw new Error("Code failed to transform");
      }

      const input = {
        code: transformedCode,
        scope,
        enableTypeScript,
      };

      if (noInline) {
        setState({ error: undefined, element: null }); // Reset output for async (no inline) evaluation
        renderElementAsync(
          input,
          (element: ComponentType) => {
            setState({ error: undefined, element });
          },
          errorCallback
        );
      } else {
        const generatedElement = generateElement(input, errorCallback);
        setState({ ...state, element: generatedElement });
      }
    } catch (e) {
      errorCallback(e as Error);
    }
  }

  const onError = (error: Error) => setState({ error: error.toString() });

  useEffect(() => {
    transpileAsync(code).catch(onError);
  }, [code, scope, noInline, transformCode]);

  const onChange = (newCode: string) => {
    transpileAsync(newCode).catch(onError);
  };

  return (
    <LiveContext.Provider
      value={{
        ...state,
        code,
        language,
        theme,
        disabled,
        onError,
        onChange,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
}

export default LiveProvider;
