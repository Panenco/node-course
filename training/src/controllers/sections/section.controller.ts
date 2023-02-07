import { Representer, Body, StatusCode } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { SectionView } from "../../contracts/views/section.view";
import { deleteSection } from "./handlers/deleteSection.handler";
import { getSection } from "./handlers/getSection.handler";
import { updateSection } from "./handlers/updateSection.handler";


@JsonController('/sections')
@Authorized()
export class SectionController {
  @Get('/:id')
  @OpenAPI({ summary: 'Get section' })
  @Representer(SectionView)
  async getSection (@Param("id") id: string) {
    return getSection(id);
  }

  @Patch('/:id')
  @OpenAPI({ summary: 'Update section' })
  @Representer(SectionView)
  async updateSection(
    @Body({}, { skipMissingProperties: true }) body: SectionView, 
    @Param("id") id: string
  ) {
    return updateSection(body, id);
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete section' })
  @Representer(null, StatusCode.noContent)
  async deleteSection(@Param("id") id: string) {
    return deleteSection(id);
  }
}