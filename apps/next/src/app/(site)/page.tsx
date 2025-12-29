import Link from 'next/link'

import { Background } from '@/components/Background'
import { Badge } from '@/components/Badge'

const Page = () => {
  return (
    <>
      <main>
        <article>
          <Badge />
          <h1>Payload 3.0</h1>
          <p>
            <Link href="https://payloadcms.com/" target="_blank">
              Payload
            </Link>{' '}
            — a headless CMS. Payload is running at <Link href="/admin">/admin</Link>. An example of
            a custom route running the Local API can be found at{' '}
            <Link href="/my-route">/my-route</Link>.
          </p>
          <p>You can use the Local API in your server components like this:</p>
        </article>
        <div className="codeBlock">
          <pre>
            <code>
              {`import { getPayload } from 'payload'
import configPromise from "@payload-config";
const payload = await getPayload({ config: configPromise })

const data = await payload.find({
  collection: 'posts',
})

return <Posts data={data} />
`}
            </code>
          </pre>
        </div>
      </main>
      <Background />
    </>
  )
}

export default Page
