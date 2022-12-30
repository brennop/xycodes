import faunadb from 'faunadb';
import { query as q } from "faunadb";

const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET!,
});

export async function getPage() {
  return client.query(
    q.Map(
      q.Paginate(q.Documents(q.Collection("codes"))),
      q.Lambda("X", q.Get(q.Var("X")))
    )
  ).then((res: any) => {
    // extract the expression from each document
    return res.data.map((doc: any) => doc.data.expression)
  });
}

export default client;
