import {useEffect} from "react";
import {setImportPromise} from "../../utils/helpers/import";

export function useLoadController({
                                      beforeInit,
                                      afterInit,
                                      onLoadPromiseInit,
                                      onProgress,
                                      getLibsPromise = Promise.resolve(),
                                      getWrapperPromise = Promise.resolve({default: null}),
                                  } = {}) {
    useEffect(() => {
        const data = {};

        let isUnmounted = false;

        const promise = (async () => {
            await getLibsPromise();

            if (isUnmounted) return data;

            const {default: WrapperClass} = await getWrapperPromise();
            const wrapper = WrapperClass.instance;

            data.wrapper = wrapper;

            onProgress && wrapper.eventBus.addEventListener("scene-controller:loading-progress", onProgress);

            if (isUnmounted) return data;

            beforeInit?.(data);

            wrapper?.init();

            afterInit?.(data);

            return data;
        })();

        data.promise = promise;
        setImportPromise(promise);

        onLoadPromiseInit?.(data)

        return () => {
            isUnmounted = true
        };
    }, []);
}
