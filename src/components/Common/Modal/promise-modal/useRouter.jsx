import { useHistory } from "react-router-dom";
import qs from "query-string";

function useRouter() {
  const history = useHistory();

  return {
    ...history,
    query: qs.parse(history.location.search)
  };
}

export default useRouter;
