import { RequestView } from './../../contracts/views/request.view';
import { Body, ListRepresenter, Representer, StatusCode } from "@panenco/papi";
import { Authorized, Delete, Get, JsonController, Param, Patch, Post } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { getRequest } from './handlers/getRequest.handler';
import { RequestBody } from '../../contracts/bodies/request.body';
import { updateRequest } from './handlers/updateRequest.handler';
import { deleteRequest } from './handlers/deleteRequest.handler';
import { SectionView } from '../../contracts/views/section.view';
import { createSection } from './handlers/createSection.handler';
import { SectionBody } from '../../contracts/bodies/section.body';
import { getSections } from './handlers/getSections.handler';

@JsonController('/requests')
@Authorized()
export class RequestController {
  @Get('/:id')
  @OpenAPI({ summary: 'Get request' })
  @Representer(RequestView)
  async getRequest (@Param("id") id: string) {
    return getRequest(id);
  }

  @Patch('/:id')
  @OpenAPI({ summary: 'Update request' })
  @Representer(RequestView)
  async updateRequest(
    @Body({}, { skipMissingProperties: true }) body: RequestBody, 
    @Param("id") id: string
  ) {
    return updateRequest(body, id);
  }

  @Delete('/:id')
  @OpenAPI({ summary: 'Delete request' })
  @Representer(null, StatusCode.noContent)
  async deleteRequest(@Param("id") id: string) {
    return deleteRequest(id);
  }

  @Post('/:id/sections')
  @OpenAPI({ summary: 'Create section' })
  @Representer(SectionView)
  async createSection(@Param("id") id: string, @Body() body: SectionBody) {
    return createSection(id, body);
  }

  @Get('/:id/sections')
  @OpenAPI({ summary: 'Get sections' })
  @ListRepresenter(SectionView)
  async getSections(@Param("id") id: string) {
    return getSections(id);
  }
}