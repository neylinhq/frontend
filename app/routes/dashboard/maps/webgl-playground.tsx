import { GraphWebGLPlaygroundPage } from '@/features/graph/graph-webgl/playground/graph-webgl-playground-page'
import { APP_NAME } from '@/shared/config'

export const meta = () => [{ title: `WebGL Playground | ${APP_NAME}` }]

export const handle = { disableScroll: true }

const WebGLPlaygroundRoute = () => {
  return <GraphWebGLPlaygroundPage />
}

export default WebGLPlaygroundRoute

