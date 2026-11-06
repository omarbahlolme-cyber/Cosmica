# Premium access model

Cosmica keeps lesson landing pages indexable and may include lesson names or short preview text in
public HTML and client assets. Those public assets are not a confidentiality boundary.

Premium entitlement gates the paid learning experience: interactive grammar explanations, full map
navigation, completion tracking, advanced review tools, and premium guidance. The authenticated user
state returned by the backend is the source of truth for enabling those features. Billing, account,
progress, gift, and administrative mutations remain server-authorized.

Product copy must describe Premium in these terms. Do not claim that every lesson title or preview
string is secret or unavailable in page source. If confidential paid course material is introduced,
store it outside `frontend/` and deliver it through an authenticated, server-authorized API.
